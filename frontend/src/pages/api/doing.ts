import { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { examId } = req.query;
  if (!examId) return res.status(400).json({ error: "Missing examId" });

  try {
    const [rows]: any[] = await db.query(
      `SELECT id, question_number, label, parent_label, level, marks, question_text FROM question_bank
       WHERE exam_paper_id = ?
       ORDER BY question_number, FIELD(level, 'main', 'sub', 'subsub'), label`,
      [examId]
    );

    res.status(200).json(rows);
  } catch (err: any) {
    console.error("Failed to load questions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}