import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const [rows]: any[] = await db.query(
    `SELECT r.id as reward_id, r.session_id, r.amount, r.confirmed,
            s.started_at, p.paper_name,
            (SELECT SUM(score) FROM student_scores WHERE session_id = s.id) AS score,
            (SELECT SUM(q.marks) FROM student_scores ss JOIN question_bank q ON ss.question_id = q.id WHERE ss.session_id = s.id) AS fullScore
     FROM reward_log r
     JOIN exam_sessions s ON r.session_id = s.id
     JOIN exam_papers p ON s.exam_paper_id = p.id
     WHERE r.user_id = ? AND r.type = 'score_rate'
     ORDER BY s.started_at DESC`,
    [user.id]
  );

  const result = rows.map((r: any) => ({
    ...r,
    accuracy: r.fullScore ? r.score / r.fullScore : 0
  }));

  return res.status(200).json(result);
}
