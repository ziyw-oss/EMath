import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { sessionId, score: submittedScore, fullScore: submittedFullScore } = req.body;
  if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

  // 查 session 开始时间
  const [[session]]: any[] = await db.query(
    "SELECT started_at FROM exam_sessions WHERE id = ? AND user_id = ?",
    [sessionId, user.id]
  );
  if (!session) return res.status(404).json({ error: "Session not found" });

  const started = new Date(session.started_at);
  const now = new Date();
  const durationMinutes = (now.getTime() - started.getTime()) / 60000;

  let totalScore = submittedScore;
  let fullScore = submittedFullScore;

  if (typeof totalScore !== "number" || typeof fullScore !== "number") {
    const [scores]: any[] = await db.query(
      `SELECT s.score, q.marks FROM student_scores s
       JOIN question_bank q ON s.question_id = q.id
       WHERE s.session_id = ?`,
      [sessionId]
    );

    totalScore = scores.reduce((sum: number, r: any) => sum + (r.score ?? 0), 0);
    fullScore = scores.reduce((sum: number, r: any) => sum + (r.marks ?? 0), 0);
  }

  const accuracy = fullScore > 0 ? totalScore / fullScore : 0;

  // 更新 score_rate 字段
  const [updateResult]: any = await db.query(
    "UPDATE exam_sessions SET score_rate = ? WHERE id = ? AND user_id = ?",
    [fullScore > 0 ? totalScore / fullScore : null, sessionId, user.id]
  );
  console.log("✅ score_rate updated, affected rows:", updateResult.affectedRows);

  let rewardGranted = false;

  if (accuracy > 0.5 && durationMinutes <= 150) {
    const rewardAmount = Math.round(accuracy * 100);

    const [existing]: any[] = await db.query(
      "SELECT id FROM reward_log WHERE session_id = ? AND user_id = ? AND type = 'score_rate'",
      [sessionId, user.id]
    );

    if (existing.length === 0) {
      await db.query(
        `INSERT INTO reward_log (user_id, session_id, type, amount, confirmed, created_at)
         VALUES (?, ?, 'score_rate', ?, 0, NOW())`,
        [user.id, sessionId, rewardAmount]
      );
      rewardGranted = true;
    }
  }

  return res.status(200).json({
    sessionId,
    score: totalScore,
    fullScore,
    accuracy: Number((accuracy * 100).toFixed(1)),
    durationMinutes: Math.round(durationMinutes),
    rewardGranted,
    rewardAmount: rewardGranted ? Math.round(accuracy * 100) : 0
  });
}
