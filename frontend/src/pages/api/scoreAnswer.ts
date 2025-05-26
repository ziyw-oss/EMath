import db from "@/lib/db";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

export interface ScoreAnswerInput {
  question_id: number;
  text: string;
  images: string[];
  questionText: string;
  meta: {
    exam_paper_id: number;
    level: string;
    question_number: string;
    parent_label?: string | null;
    label: string;
  };
  questionImagePath?: string;
  markPoints: {
    code: string;
    content: string;
    guidance: string;
  }[];
}

export async function getReferenceMarks(meta: {
  exam_paper_id: number;
  level: string;
  question_number: string;
  parent_label?: string | null;
  label: string;
}) {
  let sql = "";
  let params: any[] = [];

  if (meta.level === "main") {
    sql = `
      SELECT mark_code, mark_content, ao_code, explanation
      FROM mark_scheme
      WHERE exam_paper_id = ?
        AND level = ?
        AND question_number = ?
    `;
    params = [meta.exam_paper_id, meta.level, meta.question_number];
  } else if (meta.level === "sub") {
    sql = `
      SELECT mark_code, mark_content, ao_code, explanation
      FROM mark_scheme
      WHERE exam_paper_id = ?
        AND level = ?
        AND question_number = ?
        AND label = ?
    `;
    params = [meta.exam_paper_id, meta.level, meta.question_number, meta.label];
  } else {
    // subsub
    sql = `
      SELECT mark_code, mark_content, ao_code, explanation
      FROM mark_scheme
      WHERE exam_paper_id = ?
        AND level = ?
        AND question_number = ?
        AND label = ?
        AND parent_label <=> ?
    `;
    params = [meta.exam_paper_id, meta.level, meta.question_number, meta.label, meta.parent_label || null];
  }

  console.log("🛠 SQL:", sql, "\n📥 Params:", params);
  const [rows]: any[] = await db.query(sql, params);
  console.log("📊 Retrieved mark_scheme rows:", rows);
  return rows.map((r: any) => ({
    code: r.mark_code,
    content: r.mark_content,
    guidance: r.explanation || ""
  }));
}

export async function scoreAnswer({
  question_id,
  text,
  images,
  questionText,
  meta,
  questionImagePath,
  onStderr
}: ScoreAnswerInput & { onStderr?: (data: Buffer) => void }) {
  console.log("🛬 Received parameters in scoreAnswer:");
  console.log("  question_id:", question_id);
  console.log("  text:", text);
  console.log("  images:", images);
  console.log("  questionText:", questionText);
  console.log("  meta:", meta);
  console.log("  questionImagePath (was Base64):", questionImagePath);

  const markPoints = await getReferenceMarks(meta);

  console.log("🧾 Reference Marks:", markPoints);

  console.log("🔍 Scoring question:", question_id);
  console.log("🧩 Text:", text);
  console.log("🖼️ Images:", images);

  // Convert images to absolute paths readable by backend, avoid joining if already absolute
  const resolvedImagePaths = (images || []).map((imgPath) => {
    try {
      return path.isAbsolute(imgPath)
        ? imgPath
        : path.join(process.cwd(), "public", imgPath.replace(/^\/+/, ""));
    } catch (err) {
      console.error("⚠️ Failed to resolve image path:", imgPath, err);
      return null;
    }
  }).filter(Boolean);
  console.log("📘 Question:", questionText);
  console.log("📚 Mark Points:", markPoints);

  // const safeImages = (images || []).map((filePath) => {
  //   try {
  //       const absPath = path.join(process.cwd(), "uploads", "doing", path.basename(filePath));  
  //     const fileData = fs.readFileSync(absPath);
  //     const b64 = fileData.toString("base64");
  //     return `data:image/png;base64,${b64}`;
  //   } catch (err) {
  //     console.error("⚠️ Failed to encode image:", filePath, err);
  //     return null;
  //   }
  // }).filter(Boolean);

  // console.log("🖼️ Raw questionImageBase64 input:", questionImageBase64);
  // const imagePrefix = questionImageBase64?.startsWith("data:image/png") ? "data:image/png;base64," : questionImageBase64?.startsWith("data:image/jpeg") ? "data:image/jpeg;base64," : "data:image/png;base64,";
  // const questionImageFull = questionImageBase64
  //   ? questionImageBase64.startsWith("data:image/")
  //     ? questionImageBase64
  //     : imagePrefix + questionImageBase64
  //   : null;
  // const allImages = [
  //   ...(questionImageFull ? [questionImageFull] : []),
  //   ...safeImages
  // ];
  // console.log("🖼️ Final image filenames for GPT:", [
  //   ...(questionImageFull ? ["[question image]"] : []),
  //   ...images.map(filePath => path.basename(filePath))
  // ]);

  const payload = {
    questionText,
    markPoints,
    studentText: text,
    studentImagePaths: resolvedImagePaths,
    questionImagePath
  };

  console.log("📤 Sending image paths to Python:");
  console.log("  questionImagePath =", questionImagePath);
  console.log("  studentImagePaths =", resolvedImagePaths);

  return await new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, "../../../../../backend/scripts/score_with_gpt.py");
    
    if (!fs.existsSync(scriptPath)) {
      console.error("❌ 文件不存在:", scriptPath);
    }
    console.log("📍 Effective GPT scoring script path:", scriptPath);
    const proc = spawn("python3", [scriptPath]);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => (stdout += data.toString()));
    proc.stderr.on("data", (data) => {
      stderr += data.toString();
      if (typeof onStderr === "function") {
        onStderr(data);
      }
    });
    proc.on("close", (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          console.log("✅ GPT response:", result);
          resolve({
            score: result.score ?? 0,
            reason: result.reason ?? "No reason provided",
            matched: result.matched ?? [],
            studentImageAnalysis: result.studentImageAnalysis ?? []
          });
        } catch (err) {
          console.error("❌ Failed to parse GPT output:", err);
          console.error("🔴 Raw:", stdout);
          resolve({ score: 0, reason: "Invalid GPT output", studentImageAnalysis: [] });
        }
      } else {
        console.error("❌ GPT scoring error:", stderr);
        resolve({ score: 0, reason: "Python script error", studentImageAnalysis: [] });
      }
    });

    //console.log("📤 Final GPT payload:", JSON.stringify(payload, null, 2));
    proc.stdin.write(JSON.stringify(payload));
    proc.stdin.end();
  });
}