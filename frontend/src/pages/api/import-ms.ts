import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { exam_metadata, marks } = req.body;

  if (!exam_metadata || !marks || !Array.isArray(marks)) {
    return res.status(400).json({ error: "Missing or invalid exam_metadata or marks" });
  }

  try {
    // 查找或插入试卷
    const { board, qualification, subject, paper_code, paper_name, exam_session } = exam_metadata;
    const [paperRows] = (await db.query(
      "SELECT id FROM exam_papers WHERE board = ? AND paper_code = ? AND exam_session = ?",
      [board, paper_code, exam_session]
    ) as unknown as [any[], any]);

    let exam_paper_id;
    if (paperRows.length > 0) {
      exam_paper_id = paperRows[0].id;
    } else {
      const [insertResult] = (await db.query(
        `INSERT INTO exam_papers (board, qualification, subject, paper_code, paper_name, exam_session)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [board, qualification, subject, paper_code, paper_name, exam_session]
      ) as unknown as [any, any]);
      exam_paper_id = insertResult.insertId;
    }

    // 插入评分点
    let inserted = 0;
    for (const m of marks) {
      const { question_number, label, level, mark_code, mark_type, mark_content, ao_code, explanation, image_url } = m;

      // 查找 question_bank_id
      let question_bank_id = null;
      const [qbRows] = (await db.query(
        `SELECT id FROM question_bank WHERE exam_paper_id = ? AND question_number = ? AND label = ?`,
        [exam_paper_id, question_number, label]
      ) as unknown as [any[], any]);
      if (qbRows.length > 0) {
        question_bank_id = qbRows[0].id;
      }

      await db.query(
        `INSERT INTO mark_scheme
         (exam_paper_id, question_bank_id, question_number, label, level, mark_code, mark_type, mark_content, ao_code, explanation, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [exam_paper_id, question_bank_id, question_number, label || null, level || null, mark_code || null, mark_type || null,
         mark_content || null, ao_code || null, explanation || null, image_url || null]
      );
      inserted++;
    }

    return res.status(200).json({ exam_paper_id, inserted });
  } catch (err) {
    console.error("❌ import-ms error", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
