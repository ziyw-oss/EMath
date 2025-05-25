import fs from "fs";
import path from "path";
import { scoreAnswer, ScoreAnswerInput } from "./scoreAnswer";
import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

console.log("✅ save-and-score running from:", __dirname);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sessionId, answers } = req.body;
  if (!sessionId || !answers || typeof answers !== "object") {
    return res.status(400).json({ error: "Missing sessionId or answers" });
  }

  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user_id = typeof user === "object" && "id" in user ? user.id : null;
  if (!user_id) {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    const feedback: Record<string, { score: number; reason: string }> = {};
    for (const [question_id, ans] of Object.entries(answers)) {
      const { text, images } = ans as { text?: string; images?: string[] };
      const textAnswer = text || "";
      const imagesArray: string[] = images || [];

      const fixedImagesArray = imagesArray.map(p => {
        const filename = path.basename(p); // 提取文件名
        return path.join(process.cwd(), "uploads/doing", filename);
      });

      // 插入或更新文本答案
      await db.query(`
        INSERT INTO student_answers (session_id, user_id, question_id, text_answer)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE text_answer = VALUES(text_answer), updated_at = NOW()
      `, [sessionId, user_id, question_id, textAnswer]);

      const [rows]: any[] = await db.query(
        "SELECT id FROM student_answers WHERE session_id = ? AND question_id = ?",
        [sessionId, question_id]
      );
      const answer_id = rows?.[0]?.id;

      // 更新图片
      await db.query("DELETE FROM student_answer_images WHERE answer_id = ?", [answer_id]);
      for (const url of imagesArray) {
        await db.query(
          "INSERT INTO student_answer_images (answer_id, image_url) VALUES (?, ?)",
          [answer_id, url]
        );
      }

      // 判分
      const { questionText, meta } = ans as { text?: string; images?: string[]; questionText?: string; meta?: any };

      let sql = "";
      let params: any[] = [];

      if (meta.level === "main") {
        sql = `
          SELECT mark_code, mark_content, explanation
          FROM mark_scheme
          WHERE exam_paper_id = ?
            AND level = 'main'
            AND question_number = ?
        `;
        params = [meta.exam_paper_id, meta.question_number];
      } else if (meta.level === "subsub") {
        sql = `
          SELECT mark_code, mark_content, explanation
          FROM mark_scheme
          WHERE exam_paper_id = ?
            AND level = ?
            AND question_number = ?
            AND label = ?
            AND parent_label <=> ?
        `;
        params = [
          meta.exam_paper_id,
          meta.level,
          meta.question_number,
          meta.label,
          meta.parent_label || null
        ];
      } else {
        sql = `
          SELECT mark_code, mark_content, explanation
          FROM mark_scheme
          WHERE exam_paper_id = ?
            AND level = ?
            AND question_number = ?
            AND label = ?
        `;
        params = [
          meta.exam_paper_id,
          meta.level,
          meta.question_number,
          meta.label
        ];
      }

      sql = sql.replace("SELECT mark_code, mark_content, explanation", "SELECT mark_code, mark_content, ao_code, explanation");

      const [markRows]: any[] = await db.query(sql, params);

      const markPoints = markRows.map((r: any) => ({
        code: r.mark_code,
        content: r.mark_content,
        guidance: r.explanation || '',
        ao_code: r.ao_code || ''
      }));

      console.log("🖼️ 判分图像文件：", [
        ...(meta?.image_path ? [`[question image: ${meta.image_path}]`] : []),
        ...imagesArray.map(x => path.basename(x))
      ]);

      const imagePathValue = (meta?.image_path || "/static/question_images/q1.png").replace(/^\/+/, "");
      // 修复路径拼接: 让图片路径指向 frontend/public/static/question_images/q1.png
      const questionImagePath = path.join(
        process.cwd(),
        "public",
        imagePathValue.replace(/^public\//, "")
      );

      console.log("🐛 meta.image_path (original):", meta?.image_path || "(default fallback: /static/question_images/q1.png)");
      console.log("👉 Final questionImagePath:", questionImagePath);
      console.log("📂 Exists:", fs.existsSync(questionImagePath));

      console.log("🖼️ Final student image paths (for scoring):", fixedImagesArray);

      console.log("🐛 Calling scoreAnswer with:");
      console.log("  question_id:", question_id);
      console.log("  textAnswer:", textAnswer);
      console.log("  images:", fixedImagesArray);
      console.log("  questionText:", questionText);
      console.log("  meta:", meta);
      console.log("  questionImagePath:", questionImagePath);
      console.log("  markPoints:", markPoints);

      // 这里调用 scoreAnswer 并捕获 python stderr
      const result = await scoreAnswer({
        question_id: Number(question_id),
        text: textAnswer,
        images: fixedImagesArray,
        questionText: questionText || "",
        meta,
        questionImagePath,
        markPoints,
        onStderr: (data: Buffer) => {
          const text = data.toString().trim();
          if (text) {
            const firstLine = text.split("\n")[0];
            console.error(`🐍 PY STDERR: ${firstLine} ...`);
          }
        }
      } as ScoreAnswerInput) as { score: number; reason: string; matched?: string[] };

      await db.query(
        `INSERT INTO student_scores (session_id, user_id, question_id, score, reason, matched, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE score = VALUES(score), reason = VALUES(reason), matched = VALUES(matched), updated_at = NOW()`,
        [sessionId, user_id, question_id, result.score, result.reason, JSON.stringify(result.matched || [])]
      );
      feedback[question_id] = result;
    }
    res.status(200).json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
