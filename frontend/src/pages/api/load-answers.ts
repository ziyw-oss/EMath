

import { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const examId = req.query.examId as string;
  const user_id = req.cookies.user_id;

  if (!examId || !user_id) return res.status(400).json({ error: "Missing examId or user session" });

  try {
    const [answersRows]: any[] = await db.query(
      `SELECT sa.question_id, sa.text, i.image_url
       FROM student_answers sa
       LEFT JOIN student_answer_images i ON sa.id = i.answer_id
       WHERE sa.user_id = ? AND sa.exam_paper_id = ?`,
      [user_id, examId]
    );

    const answers: Record<number, string> = {};
    const files: Record<number, string[]> = {};

    for (const row of answersRows) {
      const qid = row.question_id;
      if (row.text && !answers[qid]) answers[qid] = row.text;
      if (row.image_url) {
        if (!files[qid]) files[qid] = [];
        files[qid].push(row.image_url);
      }
    }

    res.status(200).json({ answers, files });
  } catch (err) {
    console.error("❌ load-answers error:", err);
    res.status(500).json({ error: "Failed to load answers" });
  }
}