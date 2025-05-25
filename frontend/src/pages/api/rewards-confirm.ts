

import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing reward ID" });

  const [result]: any[] = await db.query(
    "UPDATE reward_log SET confirmed = 1 WHERE id = ? AND user_id = ?",
    [id, user.id]
  );

  return res.status(200).json({ success: true });
}