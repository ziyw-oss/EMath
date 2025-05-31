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

  // Helper function to parse note text and apply explanations to marks
  function applyNoteChunksToMarks(noteText: string, marks: any[], defaultLabel: string = "") {
    // 强制在评分点标记前加换行，防止粘连错误
    noteText = noteText.replace(/(?<!\n)([MABCDSC]\d{1,2}(?:\*?|ft)?[:：])/g, '\n$1');
    console.log("🧾 Raw note text (first 500 chars):\n", noteText.slice(0, 500));
    const noteLines = noteText.split(/\n/).map(line => line.trim()).filter(Boolean);
    const noteChunks: [string, string, string][] = [];
    let currentLabel = "";

    // 更精细的评分点段落提取逻辑
    for (let i = 0; i < noteLines.length; i++) {
      const line = noteLines[i];

      const labelMatch = line.match(/^(\([a-z]\))/i); // 子题标记 (a), (b)
      if (labelMatch) {
        currentLabel = labelMatch[1];
        continue;
      }

      const markMatch = line.match(/^((?:d)?m\d+|a\d+\*?|a\d+ft?|b\d+(?:ft)?|d{1,2}m\d+|sc|cso)[:：]/i);
      if (markMatch) {
        const currentMark = markMatch[1];
        const effectiveLabel = currentLabel || defaultLabel;

        // 收集解释段落
        let explanationLines: string[] = [];
        i++; // 从下一行开始收集
        while (i < noteLines.length) {
          const nextLine = noteLines[i];
          const isNextMark = /^(m\d+|a\d+\*?|b\d+(ft)?|d{1,2}m\d+|sc|cso)[:：]/i.test(nextLine);
          const isNextLabel = /^\([a-z]\)/i.test(nextLine);
          if (isNextMark || isNextLabel) {
            i--; // 回退一行供外层继续
            break;
          }
          explanationLines.push(nextLine);
          i++;
        }

        noteChunks.push([explanationLines.join("\n").trim(), effectiveLabel, currentMark]);
      }
    }

    console.log("🔍 Extracted noteChunks:", noteChunks.map(([t, l, m]) => `${l}${m || ''}${t.slice(0, 50)}`));

    // 为每个评分点创建 markKey
    const markKeys = marks.map((m) => ({
      key: (m.label + (m.mark_code || "")).toLowerCase().replace(/[\s()]/g, ""),
      mark: m,
    }));
    // 调试输出: 可用于匹配的 markKeys
    console.log("🧩 Available markKeys for matching:", markKeys.map(mk => mk.key));

    // 遍历 noteChunks，用索引 i 定位每个评分点说明开始
    const usedChunkIndices = new Set<number>();
    for (let i = 0; i < noteChunks.length; i++) {
      const [chunk, chunkLabel, chunkMark] = noteChunks[i];
      if (!chunkMark) continue; // 跳过无评分点标记的解释段
      const chunkKey = (chunkLabel + chunkMark).toLowerCase().replace(/[\s()]/g, "");
      // 调试信息：尝试匹配 chunkKey
      console.log(`🔑 Trying to match chunkKey: ${chunkKey}`);

      // 找到匹配的评分点索引
      const markIndex = markKeys.findIndex(mk => mk.key === chunkKey);
      if (markIndex === -1) {
        console.warn(`❌ Failed to match chunkKey: ${chunkKey}`);
        continue;
      }

      const explanationText = chunk;
      const mark = markKeys[markIndex].mark;
      if (!mark.explanation) mark.explanation = "";
      mark.explanation += (mark.explanation ? "\n" : "") + explanationText;

      console.log(`🧾 Matched explanation to: ${mark.question_number} ${mark.label}${mark.mark_code}`);
      console.log("📄 Explanation:\n" + explanationText.slice(0, 300) + "\n---");

      usedChunkIndices.add(i);
    }

    // fallback 逻辑保持不变
    const extraChunks = noteChunks.filter((_, i) => !usedChunkIndices.has(i)).map(([text]) => text);
    if (extraChunks.length > 0) {
      console.warn("⚠️ Unmatched note chunks to be appended to last mark:");
      console.warn(extraChunks.join("\n---\n"));
    }
    if (extraChunks.length > 0 && marks.length > 0) {
      const lastMark = marks[marks.length - 1];
      if (!lastMark.explanation) lastMark.explanation = "";
      lastMark.explanation += (lastMark.explanation ? "\n" : "") + "[Note continuation]\n" + extraChunks.join("\n");
      // 调试日志：追加 fallback 说明后立即输出评分点 label、mark_code 和最终 explanation 内容
      console.log(`🧾 Final fallback explanation added to last mark: ${lastMark.label}${lastMark.mark_code}`);
      console.log("📄 Full explanation after fallback:\n" + lastMark.explanation.slice(0, 500));
    }
  }

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
    if (!file || Array.isArray(file)) {
      responded = true;
      return res.status(400).json({ error: "No file uploaded." });
    }
    console.log("📦 Uploaded file path:", file.filepath);

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

      const allMarks: any[] = [];
      // Image hash cache: Set of hashes seen so far
      const seenHashes = new Set<string>();
      // For reuse: last result from previous image
      let lastResult: any = null;
      let seenFirstHeader = false;

      let page1Text = "";

      try {
        for (let i = 0; i < imageFiles.length; ++i) {
          try {
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

                  // 调用 parse_notescheme.py 脚本 (GPT) 解析解释页，一次性调用
                  let parsedNoteMarks: any[] = [];
                  try {
                    const noteschemeProcess = spawn("python3", [
                      path.resolve(process.cwd(), "../backend/scripts/parse_notescheme.py"),
                      imgPath,
                    ]);

                    // --- Add stderr capturing ---
                    let stderr = "";
                    noteschemeProcess.stderr.on("data", (data) => {
                      stderr += data.toString();
                    });
                    // --- End stderr capturing ---

                    let noteschemeJson = "";
                    for await (const chunk of noteschemeProcess.stdout) {
                      noteschemeJson += chunk.toString();
                    }
                    await new Promise((resolve) => noteschemeProcess.on("close", resolve));
                    console.log("📤 Raw GPT response for notescheme:\n", noteschemeJson);

                    // 输出 stderr from parse_notescheme.py
                    //console.log("🐍 stderr from parse_notescheme.py:", stderr);

                  // 改为基于块提取方式的解析逻辑
                  
                  const blocks = noteschemeJson
                  
                    //.split(/\n(?=\([a-z]\)\s*$)/i) // 拆分为每个子题段块，格式如 (a)
                    .split(/(?=^\([a-z]\))/gmi)// ✅ 行首开始的新子题
                    .map(b => b.trim())
                    .filter(Boolean);
                  
                  console.log("📤 Raw GPT response 拆分后 blocks:\n", blocks);

                  for (const block of blocks) {
                    const lines = block.split(/\n/).map(l => l.trim()).filter(Boolean);
                    console.log("📤 Blocks into lines:\n", lines);
                    console.log("📤 lines.length:", lines.length);

                    if (lines.length === 0) continue;
                    
                    const labelLine = lines[0].match(/^\(([a-z])\)/i);
                    
                    if (!labelLine) continue;
                    const currentLabel = `(${labelLine[0]})`;
                    console.log("📤 currentLabel:", currentLabel);

                    // 新的评分点解析逻辑：遇到下一个评分点标记立即停止收集
                    for (let i = 0; i < lines.length; i++) {
                      console.log("📤 lines["+i+"]:\n", lines[i]);
                      const markMatch = lines[i].match(/([A-Z]{1,2}\d+(?:\*|ft)?)[：:]\s*(.*)/i);
                      console.log("📤 markMatch:", markMatch);
                      if (!markMatch) continue;
                      console.log("📤 markMatch[1]:", markMatch[1]);
                      console.log("📤 markMatch[2]:", markMatch[2]);
                      const mark_code = markMatch[1];
                      const firstLine = markMatch[2];

                      // 收集 explanation 行
                      const explanationLines = [firstLine];
                      i++;
                      while (
                        i < lines.length &&
                        !lines[i].match(/^[A-Z]{1,2}\d+(?:\*|ft)?[:：]/) && // 遇到下一个评分点就停止
                        !lines[i].match(/^\([a-z]\)/i)
                      ) {
                        explanationLines.push(lines[i]);
                        i++;
                      }
                      i--; // 回退一行给外层 for 使用

                      const explanation = explanationLines.join("\n").trim();
                      parsedNoteMarks.push({ label: currentLabel, mark_code, explanation });
                    }
                  }
                  } catch (e) {
                    console.error("❌ Failed to invoke parse_notescheme.py:", e);
                  }

                  // fallback 日志与匹配逻辑保持不变
                  if (parsedNoteMarks.length > 0 && allMarks.length > 0) {
                    // 🆕 在匹配逻辑开始前插入调试输出
                    // 调试输出：GPT返回的所有 cleanedKey，带类型注解
                    const gptCleanedKeys = parsedNoteMarks.map((note: { label: string; mark_code: string }) =>
                      (note.label + note.mark_code).toLowerCase().replace(/[\s()]/g, "")
                    );
                    console.log("🧪 All GPT cleanedKeys:", gptCleanedKeys);

                    // 调试输出：lastResult中可匹配的所有评分点 key，带类型注解
                    const lastMarkKeys = (lastResult?.marks || []).map((m: { label: string; mark_code?: string }) =>
                      (m.label + (m.mark_code || "")).toLowerCase().replace(/[\s()]/g, "")
                    );
                    console.log("🔑 Available lastResult mark keys:", lastMarkKeys);

                    for (const note of parsedNoteMarks) {
                      const { label, mark_code, explanation } = note;
                      const cleanedKey = (label + mark_code).toLowerCase().replace(/[\s()]/g, "");
                      // --- 新增调试日志 ---
                      console.log("🔧 Converted GPT mark label+code to cleanedKey:", cleanedKey);
                      console.log("🧩 Looking for cleanedKey:", cleanedKey);
                      console.log("🔑 available marks in lastResult:", (lastResult?.marks || []).map(
                        (m: { label: string; mark_code?: string }) => (m.label + (m.mark_code || "")).toLowerCase().replace(/[\s()]/g, "")
                      ));
                      // --- 原有匹配逻辑，带类型注解和调试输出 ---
                      const matchedMark = (lastResult?.marks || []).find((m: { label: string; mark_code?: string }) => {
                        const currentKey = (m.label + (m.mark_code || "")).toLowerCase().replace(/[\s()]/g, "");
                        console.log("🔍 Comparing mark key:", currentKey, "vs", cleanedKey);
                        return currentKey === cleanedKey;
                      });
                      if (matchedMark) {
                        matchedMark.explanation += (matchedMark.explanation ? "\n" : "") + explanation;
                        // 日志：追加解释内容后立即打印评分点对象完整结构（立刻打印，确保实际被追加）
                        console.log(`🧾 Matched GPT explanation to: ${matchedMark.question_number} ${matchedMark.label}${matchedMark.mark_code}`);
                        console.log("📌 Updated matchedMark content:", JSON.stringify(matchedMark, null, 2));
                      } else {
                        console.warn(`❌ GPT explanation [${label}${mark_code}] could not be matched to any existing mark`);
                      }
                    }
                    console.log("🧾 Appended GPT explanation from parse_notescheme.py to matched marks.");
                  }
                  // 新增调试输出：在判断前输出所有 cleanedKey
                  if (parsedNoteMarks.length > 0) {
                    console.log(`🧪 Parsed GPT explanations cleanedKeys (${parsedNoteMarks.length} items):`);
                    for (const note of parsedNoteMarks) {
                      const cleanedKey = (note.label + note.mark_code).toLowerCase().replace(/[\s()]/g, "");
                      console.log("🔧 cleanedKey:", cleanedKey);
                    }
                  } else {
                    console.warn("⚠️ No parsed explanations found in GPT notescheme response.");
                  }
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
                let attempt = 0;
                while (attempt < 3) {
                  attempt++;
                  try {
                    console.log(`🔁 GPT parsing attempt ${attempt} for page ${pageIndex}`);
                    await new Promise<void>((resolve, reject) => {
                      const parseProcess = spawn("python3", [
                        path.resolve(process.cwd(), "../backend/scripts/parse_markscheme.py"),
                        imgPath,
                      ]);

                      let stdoutData = "";
                      let stderrData = "";

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
                            jsonOutput = JSON.parse(stdoutData);
                            resolve();
                          } catch (err) {
                            reject(new Error(`❌ Failed to parse JSON: ${err}`));
                          }
                        }
                      });
                    });
                    break; // ✅ 成功后跳出 retry 循环
                  } catch (err) {
                    console.error(`⚠️ Attempt ${attempt} failed:`, err);
                    if (attempt === 3) throw err;
                    await new Promise((r) => setTimeout(r, 1000)); // ⏱️ 等待 1s 再重试
                  }
                }
              }
              lastResult = jsonOutput;
            }

            // Now process jsonOutput as before
            const hasMarks = Array.isArray(jsonOutput?.marks) && jsonOutput.marks.length > 0;
            if (!hasMarks) {
              console.log(`⚠️ No marks on page ${pageIndex}. JSON output was:`, JSON.stringify(jsonOutput, null, 2));
              if (jsonOutput?.explanation) {
                // Explanation from GPT output can be appended to last marks if any
                if (allMarks.length > 0) {
                  allMarks[allMarks.length - 1].explanation = (allMarks[allMarks.length - 1].explanation || "") +
                    (allMarks[allMarks.length - 1].explanation ? "\n" : "") + jsonOutput.explanation;
                }
              }
              continue;
            }
            // Log before integrating marks
            console.log(`📌 Proceeding to integrate marks from page ${pageIndex}...`);
            if (Array.isArray(jsonOutput.marks) && jsonOutput.marks.length > 0) {
              allMarks.push(...jsonOutput.marks);
              console.log("📋 Merged marks so far:", allMarks.length);
              console.log(`✅ Page ${pageIndex}: ${jsonOutput.marks.length} marks added`);
              console.log(`📬 Received ${jsonOutput.marks.length} marks from GPT for page ${pageIndex}`);
            }
          } catch (err) {
            console.error(`❌ Failed to process page ${i + 1}:`, err);
            continue;
          }
        }

        // Ensure each mark has an 'explanation' property
        for (const mark of allMarks) {
          if (!("explanation" in mark)) {
            mark.explanation = "";
          }
        }
        // Write marks to tmp/output_marks.json before returning
        const outputPath = path.resolve(process.cwd(), "tmp/output_marks.json");
        const outputData = JSON.stringify({ marks: allMarks, exam_metadata: { page1_text: page1Text.trim() } }, null, 2);
        console.log("📦 Final JSON content preview:\n" + outputData.slice(0, 1000) + "\n---");
        fs.writeFileSync(outputPath, outputData, "utf8");
        console.log(`💾 Final output written to ${outputPath}`);
        responded = true;
        return res.status(200).json({ marks: allMarks, exam_metadata: { page1_text: page1Text.trim() } });
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
