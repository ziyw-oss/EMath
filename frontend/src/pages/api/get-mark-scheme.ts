import { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { exam_paper_id } = req.query;
  if (!exam_paper_id) return res.status(400).json({ error: "Missing exam_paper_id" });

  
  try {
    const [rows] = await db.query(
      `SELECT question_number, label, parent_label, mark_code, mark_type, mark_content, explanation, level, ao_code
       FROM mark_scheme
       WHERE exam_paper_id = ?
       ORDER BY question_number, label, mark_code`,
      [exam_paper_id]
    );
    res.status(200).json({ marks: rows });
  } catch (err: any) {
    console.error("Query error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
}