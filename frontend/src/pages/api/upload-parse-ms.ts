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

      let page1Text = "";

      try {
        for (let i = 0; i < imageFiles.length; ++i) {
          const pageIndex = i + 1;
          const pageStatus = pagesStatus.find(p => p.page === pageIndex);
          // Debug output for table/header status
          console.log(`🔍 Page ${pageIndex} status: has_table=${pageStatus?.has_table}, has_header=${pageStatus?.has_header}`);
          if (!pageStatus) {
            console.log(`⛔ Skipping Page ${pageIndex} (no status info)`);
            lastResult = null;
            continue;
          }

          const imgFile = imageFiles[i];
          const imgPath = path.resolve(imageDir, imgFile);

          // Compute hash for the image
          const imgBuffer = fs.readFileSync(imgPath);
          const imgHash = crypto.createHash("sha256").update(imgBuffer).digest("hex");

          console.log(`📄 Page ${pageIndex}: hash = ${imgHash}`);

          if (pageIndex === 1 && !MOCK_MODE) {
            const titleText = await tesseract.recognize(imgPath);
            page1Text = titleText;
            // Removed extraction of paperCode, paperName, examSession and board
            // 调试输出: 识别出的试卷信息
            console.log("📘 Extracted Exam Info:");
            console.log("📄 page1_text:", page1Text.trim());
          }

          let jsonOutput: any = null;
          if (seenHashes.has(imgHash)) {
            // Reuse last result if hash seen before
            console.log(`🔁 Page ${pageIndex}: skipped due to hash match`);
            jsonOutput = lastResult;
          } else {
            seenHashes.add(imgHash);

            if (!pageStatus.has_header && seenFirstHeader) {
              console.log(`📝 Page ${pageIndex} appended to noteBuffer (no header, after scoring begins)`);
              console.log(`📝 Page ${pageIndex}: treated as Notes (no header, after scoring begins)`);
              const ocrText = await tesseract.recognize(imgPath);
              noteBuffer += (noteBuffer ? "\n" : "") + ocrText;
              lastResult = null;
              continue;
            }
            if (!pageStatus.has_header && !seenFirstHeader) {
              console.log(`📄 Page ${pageIndex}: skipped (no header, before scoring)`);
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
                      // Debug output: show first 2000 chars of GPT raw content
                      //console.log(`📥 GPT raw_content for page ${pageIndex}:\n${stdoutData.slice(0, 2000)}\n---`);
                      //console.log(`📤 Raw JSON from Python for page ${pageIndex}: ${stdoutData.slice(0, 200)}...`);
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
          const hasMarks = Array.isArray(jsonOutput?.marks) && jsonOutput.marks.length > 0;
          if (!hasMarks) {
            console.log(`⚠️ No marks on page ${pageIndex}. JSON output was:`, JSON.stringify(jsonOutput, null, 2));
            if (jsonOutput?.explanation) {
              noteBuffer += (noteBuffer ? "\n" : "") + jsonOutput.explanation;
            }
            continue;
          }
          // Log before integrating marks
          console.log(`📌 Proceeding to integrate marks from page ${pageIndex}...`);
          if (Array.isArray(jsonOutput.marks) && jsonOutput.marks.length > 0) {
            // 拆分 notes 按评分点标识，合并到 marks（方法 A）
            if (noteBuffer) {
              const noteLines = noteBuffer.split(/\n/).map(line => line.trim()).filter(Boolean);
              // noteChunks: [chunkText, label]
              const noteChunks: [string, string][] = [];
              let currentLabel = "";
              for (const line of noteLines) {
                // 检查是否为 label 行 (如 (a), (b), ...)
                const labelMatch = line.match(/^\(([a-z])\)/i);
                if (labelMatch) {
                  currentLabel = labelMatch[0]; // e.g., "(b)"
                  continue;
                }
                const markStart = /^(\(?[a-z]+\)?\(?[a-z]+\)?\s*)?(m1|a1\*?|b1(ft)?|d?m\d?)[:：]/i;
                if (noteChunks.length === 0 || markStart.test(line)) {
                  noteChunks.push([line, currentLabel]);
                } else {
                  const last = noteChunks.length - 1;
                  noteChunks[last][0] += " " + line;
                }
              }

              // 方法A：逐个评分点分配chunk，且每个chunk最多只分配给一个评分点
              const usedChunks = new Set<number>();
              for (const mark of lastMarks) {
                const markKey = (mark.label + (mark.mark_code || "")).toLowerCase().replace(/[\s()]/g, "");
                for (let i = 0; i < noteChunks.length; i++) {
                  if (usedChunks.has(i)) continue;
                  const [chunk, chunkLabel] = noteChunks[i];
                  const match = chunk.match(/^(\(?[a-z]+\)?\(?[a-z]+\)?\s*)?(m1|a1\*?|b1(ft)?|d?m\d?)[:：]/i);
                  if (!match) continue;
                  const markCodeRaw = (match[2] || "").toUpperCase();
                  const candidateKey = ((chunkLabel || "") + markCodeRaw).toLowerCase().replace(/[\s()]/g, "");
                  if (candidateKey === markKey) {
                    if (!mark.explanation) mark.explanation = "";
                    mark.explanation += (mark.explanation ? "\n" : "") + chunk;
                    usedChunks.add(i);
                    console.log(`🧩 Explanation matched for mark: label=${mark.label}, code=${mark.mark_code}`);
                    console.log(`⬇️ Explanation content:\n${chunk}`);
                    break;
                  }
                }
              }
              // 将未分配的 chunk 追加到最后评分点
              const extraChunks = noteChunks.filter((_, i) => !usedChunks.has(i)).map(([text]) => text);
              if (extraChunks.length > 0 && lastMarks.length > 0) {
                const lastMark = lastMarks[lastMarks.length - 1];
                const extraText = extraChunks.join("\n");
                if (!lastMark.explanation) lastMark.explanation = "";
                // Add a comment indicating this explanation is from notes continuation
                lastMark.explanation += (lastMark.explanation ? "\n" : "") + "[Note continuation]\n" + extraText;
              }
              console.log(`🪄 Final marks for page ${pageIndex}:\n`, JSON.stringify(lastMarks, null, 2));
              noteBuffer = "";
            }
            marks.push(...jsonOutput.marks);
            console.log("📋 Merged marks so far:", marks.length);
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
        const outputData = JSON.stringify({ marks, exam_metadata: { page1_text: page1Text.trim() } }, null, 2);
        console.log("📦 Final JSON content preview:\n" + outputData.slice(0, 1000) + "\n---");
        fs.writeFileSync(outputPath, outputData, "utf8");
        console.log(`💾 Final output written to ${outputPath}`);
        responded = true;
        return res.status(200).json({ marks, exam_metadata: { page1_text: page1Text.trim() } });
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
