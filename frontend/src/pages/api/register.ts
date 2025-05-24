import { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [exists]: any[] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length > 0) return res.status(400).json({ error: "Email already registered" });

    const password_hash = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'student')",
      [email, name, password_hash]
    );

    res.status(200).json({ message: "Registration successful" });
  } catch (err: any) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}