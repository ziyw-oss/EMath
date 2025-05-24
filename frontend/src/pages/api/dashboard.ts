import { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getCurrentUser(req) as { id: number };
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const [rows]: any[] = await db.query("SELECT id, name, email FROM users WHERE id = ?", [user.id]);
    const profile = rows[0];

    res.status(200).json(profile);
  } catch (err: any) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}