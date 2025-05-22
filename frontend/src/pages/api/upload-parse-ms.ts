import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";
import crypto from "crypto";
import tesseract from "node-tesseract-ocr";
// If true, use mock/page_x.json instead of calling Python for parsing
const MOCK_MODE = false;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let responded = false;


  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    responded = true;
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    console.log("📨 Entered form.parse");
    if (err) {
      responded = true;
      return res.status(500).json({ error: "Failed to parse form data." });
    }

    const file = files.pdf?.[0] || files.pdf;
    console.log("📦 Uploaded file:", file);
    if (!file || Array.isArray(file)) {
      responded = true;
      return res.status(400).json({ error: "No file uploaded." });
    }

    console.log("📥 File received", file.filepath);

    try {
      const imageDir = path.resolve(process.cwd(), "tmp/markscheme_pages");
      fs.mkdirSync(imageDir, { recursive: true });

      // 🧠 调用 detect_tables_in_pdf.py，提前识别评分页
      console.log("🐍 Running detect_tables_in_pdf.py:", [
        "python3",
        path.resolve(process.cwd(), "../backend/scripts/detect_tables_in_pdf.py"),
        file.filepath
      ]);
      const detectProcess = spawn("python3", [
        path.resolve(process.cwd(), "../backend/scripts/detect_tables_in_pdf.py"),
        file.filepath
      ]);

      await new Promise((resolve, reject) => {
        detectProcess.on("close", (code) => {
          if (code !== 0) {
            console.error("❌ Table detection failed with code", code);
            reject(new Error("Table detection failed"));
          } else {
            console.log("✅ Table detection finished successfully");
            resolve(null);
          }
        });
      });

      const convertProcess = spawn("python3", [
        path.resolve(process.cwd(), "../backend/scripts/convert_ms_to_images.py"),
        file.filepath,
        imageDir
      ]);

      await new Promise((resolve, reject) => {
        convertProcess.on("close", (code) => {
          if (code !== 0) reject(new Error("Image conversion failed"));
          else resolve(null);
        });
      });

      // Read all images in imageDir sorted by page number
      const imageFiles = fs.readdirSync(imageDir)
        .filter(f => /\.(png|jpe?g|bmp|tiff?|webp)$/i.test(f))
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
          const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
          return numA - numB;
        });

      const pagesWithTablesPath = path.resolve(process.cwd(), "tmp/pages_with_tables.json");
      let pagesStatus: { page: number, has_table: boolean, has_header: boolean }[] = [];
      if (fs.existsSync(pagesWithTablesPath)) {
        const data = fs.readFileSync(pagesWithTablesPath, "utf8");
        const parsed = JSON.parse(data);
        pagesStatus = parsed.pages || [];
      } else {
        console.warn("⚠️ pages_with_tables.json not found. Defaulting to process all pages.");
      }

      const marks: any[] = [];
      let noteBuffer = "";
      let lastMarks: any[] = [];
      // Image hash cache: Set of hashes seen so far
      const seenHashes = new Set<string>();
      // For reuse: last result from previous image
      let lastResult: any = null;
      let seenFirstHeader = false;

      try {
        for (let i = 0; i < imageFiles.length; ++i) {
          const pageIndex = i + 1;
          const pageStatus = pagesStatus.find(p => p.page === pageIndex);
          if (!pageStatus || !pageStatus.has_table) {
            console.log(`⛔ Skipping Page ${pageIndex} (no table)`);
            lastResult = null;
            continue;
          }

          const imgFile = imageFiles[i];
          const imgPath = path.resolve(imageDir, imgFile);

          // Compute hash for the image
          const imgBuffer = fs.readFileSync(imgPath);
          const imgHash = crypto.createHash("sha256").update(imgBuffer).digest("hex");

          console.log(`📄 Page ${pageIndex}: hash = ${imgHash}`);

          let jsonOutput: any = null;
          if (seenHashes.has(imgHash)) {
            // Reuse last result if hash seen before
            console.log(`🔁 Page ${pageIndex}: skipped due to hash match`);
            jsonOutput = lastResult;
          } else {
            seenHashes.add(imgHash);

            if (!pageStatus.has_header && seenFirstHeader) {
              console.log(`📝 Page ${pageIndex}: treated as Notes (table w/o header, after scoring begins)`);
              const ocrText = await tesseract.recognize(imgPath);
              noteBuffer += (noteBuffer ? "\n" : "") + ocrText;
              lastResult = null;
              continue;
            }

            if (!pageStatus.has_header && !seenFirstHeader) {
              console.log(`📄 Page ${pageIndex}: skipped (table w/o header, before scoring)`);
              lastResult = null;
              continue;
            }

            seenFirstHeader = true;

            // ✅ 此时仅当 hasHeader === true 才会调用 GPT
            if (MOCK_MODE) {
              // Load mock/page_x.json (x = i+1)
              const mockPath = path.resolve(process.cwd(), `mock/page_${pageIndex}.json`);
              if (!fs.existsSync(mockPath)) {
                throw new Error(`Mock file not found: ${mockPath}`);
              }
              const mockData = fs.readFileSync(mockPath, "utf8");
              jsonOutput = JSON.parse(mockData);
            } else {
              console.log(`📨 Sending image to GPT via parse_markscheme.py: ${imgFile}`);
              console.log("🧠 Spawning parse_markscheme.py for", imgFile);
              // Call Python script as before
              const parseProcess = spawn("python3", [
                path.resolve(process.cwd(), "../backend/scripts/parse_markscheme.py"),
                imgPath,
              ]);

              let stdoutData = "";
              let stderrData = "";

              await new Promise<void>((resolve, reject) => {
                parseProcess.stdout.on("data", (data) => {
                  stdoutData += data.toString();
                });

                parseProcess.stderr.on("data", (data) => {
                  stderrData += data.toString();
                  console.log(`🐍 stderr: ${data.toString()}`);
                });

                parseProcess.on("close", (code) => {
                  console.log(`✅ Python exited with code ${code}`);
                  if (code !== 0) {
                    reject(new Error(`parse_page.py failed on ${imgFile}: ${stderrData}`));
                  } else {
                    try {
                      console.log(`📤 Raw JSON from Python for page ${pageIndex}: ${stdoutData.slice(0, 200)}...`);
                      jsonOutput = JSON.parse(stdoutData);
                      resolve();
                    } catch (err: unknown) {
                      const error = err as Error;
                      responded = true;
                      return res.status(500).json({ error: "Failed to parse pages.", detail: error.message });
                    }
                  }
                });
              });
            }
            lastResult = jsonOutput;
          }

          // Now process jsonOutput as before
          if (!jsonOutput || !jsonOutput.header) {
            // No header means this page is explanation content
            if (jsonOutput?.explanation) {
              noteBuffer += (noteBuffer ? "\n" : "") + jsonOutput.explanation;
            }
            // Skip adding marks from this page
            continue;
          }
          if (Array.isArray(jsonOutput.marks) && jsonOutput.marks.length > 0) {
            // 拆分 notes 按评分点标识，合并到 marks
            if (noteBuffer) {
              const noteLines = noteBuffer.split(/\n/).map(line => line.trim()).filter(Boolean);
              const noteChunks: string[] = [];

              // 组装每个评分点段落（支持多行合并）
              for (const line of noteLines) {
                const markStart = /^(\(?[a-z]+\)?\(?[a-z]+\)?\s*)?(m1|a1\*?|b1(ft)?|d?m\d?)[:：]/i;
                if (noteChunks.length === 0 || markStart.test(line)) {
                  noteChunks.push(line);
                } else {
                  noteChunks[noteChunks.length - 1] += " " + line;
                }
              }

              // 建立评分点查找索引
              const markIndex = new Map<string, any>();
              for (const mark of jsonOutput.marks) {
                const markKey = (mark.label + (mark.mark_code || "")).toLowerCase().replace(/[\s()]/g, "");
                markIndex.set(markKey, mark);
              }

              // 按标识查找并赋值
              for (const chunk of noteChunks) {
                const match = chunk.match(/^(\(?[a-z]+\)?\(?[a-z]+\)?\s*)?(m1|a1\*?|b1(ft)?|d?m\d?)[:：]/i);
                if (!match) continue;
                const labelRaw = (match[1] || "").trim();
                const markCodeRaw = (match[2] || "").toUpperCase();
                const label = labelRaw.replace(/\s+/g, "");
                const markKey = (label + markCodeRaw).toLowerCase().replace(/[\s()]/g, "");
                const mark = markIndex.get(markKey);
                if (mark) {
                  if (!mark.explanation) mark.explanation = "";
                  mark.explanation += (mark.explanation ? "\n" : "") + chunk;
                }
              }
              noteBuffer = "";
            }
            marks.push(...jsonOutput.marks);
            console.log(`✅ Page ${pageIndex}: ${jsonOutput.marks.length} marks added`);
            console.log(`📬 Received ${jsonOutput.marks.length} marks from GPT for page ${pageIndex}`);
            lastMarks = jsonOutput.marks;
          }
        }

        // Ensure each mark has an 'explanation' property
        for (const mark of marks) {
          if (!("explanation" in mark)) {
            mark.explanation = "";
          }
        }
        // Write marks to tmp/output_marks.json before returning
        const outputPath = path.resolve(process.cwd(), "tmp/output_marks.json");
        fs.writeFileSync(outputPath, JSON.stringify({ marks }, null, 2), "utf8");
        console.log(`💾 Final output written to ${outputPath}`);
        responded = true;
        return res.status(200).json({ marks });
      } catch (err: unknown) {
        const error = err as Error;
        responded = true;
        return res.status(500).json({ error: "Failed to parse pages.", detail: error.message });
      }
    } catch (e: any) {
      responded = true;
      return res.status(500).json({ error: "Failed to process PDF.", detail: e?.message });
    }
  });
}
