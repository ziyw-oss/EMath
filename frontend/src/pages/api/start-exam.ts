import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { examId } = req.body;
  if (!examId) return res.status(400).json({ error: "Missing examId" });

  const [result]: any = await db.query(
    "INSERT INTO exam_sessions (user_id, exam_paper_id, started_at) VALUES (?, ?, NOW())",
    [user.id, examId]
  );

  const sessionId = result.insertId;
  return res.status(200).json({ sessionId });
}