import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const exam_paper_id = req.query.exam_paper_id as string;

  if (!exam_paper_id || isNaN(Number(exam_paper_id))) {
    return res.status(400).json({ error: "Missing or invalid exam_paper_id" });
  }

  try {
    const [examRows] = (await db.query("SELECT * FROM exam_papers WHERE id = ?", [exam_paper_id]) as unknown as [any[], any]);
    if (examRows.length === 0) {
      return res.status(404).json({ error: "Exam paper not found" });
    }

    const [questions] = (await db.query(
      `SELECT id, question_number, label, level, marks, question_text, latex_blocks, parent_label
       FROM question_bank WHERE exam_paper_id = ? ORDER BY id ASC`,
      [exam_paper_id]
    ) as unknown as [any[], any]);

    // Safely parse latex_blocks for each question
    questions.forEach((q) => {
      if (typeof q.latex_blocks === "string") {
        try {
          q.latex_blocks = JSON.parse(q.latex_blocks);
        } catch {
          q.latex_blocks = [];
        }
      }
    });
    return res.status(200).json({
      exam_metadata: examRows[0],
      questions
    });
  } catch (error) {
    console.error("❌ load-qp error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}