import { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

  try {
    const [[sessionRow]]: any[] = await db.query(
      "SELECT exam_paper_id FROM exam_sessions WHERE id = ?",
      [sessionId]
    );
    if (!sessionRow) return res.status(404).json({ error: "Session not found" });
    const examId = sessionRow.exam_paper_id;

    const [rows]: any[] = await db.query(
      `SELECT 
        q.id, q.question_number, q.label, q.parent_label, q.level, q.marks, q.question_text,
        q.image_path, q.exam_paper_id,
        e.exam_session AS exam_year, e.paper_name AS exam_type,
        s.score, s.matched
       FROM question_bank q
       JOIN exam_papers e ON q.exam_paper_id = e.id
       LEFT JOIN student_scores s ON s.question_id = q.id AND s.session_id = ?
       WHERE q.exam_paper_id = ?
       ORDER BY q.question_number, FIELD(q.level, 'main', 'sub', 'subsub'), q.label`,
      [sessionId, examId]
    );

    const totalQuestions = rows.filter((q: any) => q.marks !== null).length;
    res.status(200).json({ questions: rows, totalQuestions });
  } catch (err: any) {
    console.error("Failed to load questions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}