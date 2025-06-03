import { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getCurrentUser(req) as { id: number };
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const [[profile]]: any[] = await db.query("SELECT id, name, email FROM users WHERE id = ?", [user.id]);

    const [unfinished]: any[] = await db.query(
      `SELECT s.id as session_id, p.paper_name, s.started_at
       FROM exam_sessions s
       JOIN exam_papers p ON s.exam_paper_id = p.id
       WHERE s.user_id = ? AND s.completed_at IS NULL
       ORDER BY s.started_at DESC`,
      [user.id]
    );

    profile.unfinished_exams = unfinished;

    const [completed]: any[] = await db.query(
      `SELECT 
         s.id AS session_id,
         p.paper_name AS title,
         s.completed_at AS ended_at,
         s.score_rate
       FROM exam_sessions s
       JOIN exam_papers p ON s.exam_paper_id = p.id
       WHERE s.user_id = ? AND s.completed_at IS NOT NULL
       ORDER BY s.completed_at DESC`,
      [user.id]
    );

    profile.completed_exams = completed;

    res.status(200).json(profile);
  } catch (err: any) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}