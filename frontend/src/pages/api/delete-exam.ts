

import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sessionId = req.query.sessionId;
  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId" });
  }

  await db.query("DELETE FROM student_scores WHERE session_id = ?", [sessionId]);
  await db.query("DELETE FROM exam_sessions WHERE id = ?", [sessionId]);

  return res.status(200).json({ success: true });
}