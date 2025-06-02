import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { exam_metadata, questions } = req.body;

  if (!exam_metadata || !questions) {
    return res.status(400).json({ error: "Missing exam_metadata or questions" });
  }

  try {
    // 1. 查找或插入试卷
    const { board, qualification, subject, paper_code, paper_name, exam_session } = exam_metadata;
    // 只保留 exam_session 中的年份
    const sessionYear = exam_session.match(/\d{4}/)?.[0] || exam_session;
    const updatedPaperName = `${sessionYear} ${paper_name}`;
    console.log("🔎 SQL (select exam_paper): SELECT id FROM exam_papers WHERE board = ? AND paper_code = ? AND exam_session = ? AND paper_name = ?", [board, paper_code, sessionYear, updatedPaperName]);
    const [paperRows] = (await db.query(
      "SELECT id FROM exam_papers WHERE board = ? AND paper_code = ? AND exam_session = ? AND paper_name = ?",
      [board, paper_code, sessionYear, updatedPaperName]
    ) as unknown as [any[], any]);

    let exam_paper_id;
    if (paperRows.length > 0) {
      exam_paper_id = paperRows[0].id;
    } else {
      console.log("📥 SQL (insert exam_paper): INSERT INTO exam_papers (board, qualification, subject, paper_code, paper_name, exam_session) VALUES (?, ?, ?, ?, ?, ?)", [board, qualification, subject, paper_code, updatedPaperName, sessionYear]);
      const [result] = (await db.query(
        `INSERT INTO exam_papers (board, qualification, subject, paper_code, paper_name, exam_session)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [board, qualification, subject, paper_code, updatedPaperName, sessionYear]
      ) as unknown as [any, any]);
      exam_paper_id = result.insertId;
    }

    // 2. 插入题目（去重）
    let inserted = 0;
    let currentSubLabel = null;
    for (const q of questions) {
      const label = q.label || "";
      const level = q.level || "";
      let parent_label = null;
      if (level === "sub") {
        currentSubLabel = label;
      } else if (level === "subsub") {
        parent_label = currentSubLabel;
      }

      console.log("🔍 Checking:", label, level);

      try {
        console.log("📝 SQL (insert question): INSERT INTO question_bank (exam_paper_id, question_number, label, level, marks, question_text, latex_blocks, parent_label) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
          exam_paper_id,
          q.question_number || null,
          label,
          level,
          q.marks ?? null,
          q.question_text || null,
          q.latex_blocks ? JSON.stringify(q.latex_blocks) : null,
          parent_label
        ]);
        await db.query(
          `INSERT INTO question_bank
           (exam_paper_id, question_number, label, level, marks, question_text, latex_blocks, parent_label)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            exam_paper_id,
            q.question_number || null,
            label,
            level,
            q.marks ?? null,
            q.question_text || null,
            q.latex_blocks ? JSON.stringify(q.latex_blocks) : null,
            parent_label
          ]
        );
        console.log("✅ Inserted question:", {
          question_number: q.question_number,
          label,
          level,
          marks: q.marks,
          text: q.question_text?.slice(0, 50),
          parent_label
        });
        inserted++;
      } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
          console.log("⚠️ Duplicate question skipped:", { label, level, question_number: q.question_number });
          continue;
        } else {
          throw err;
        }
      }
    }

    console.log("📊 Total inserted:", inserted);

    return res.status(200).json({ exam_paper_id, inserted });
  } catch (error) {
    console.error("❌ import-qp error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
