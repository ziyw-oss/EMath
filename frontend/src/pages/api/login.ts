import { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  try {
    const [rows]: any[] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "User not found" });

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) return res.status(401).json({ error: "Incorrect password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.setHeader("Set-Cookie", `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`);
    res.status(200).json({ message: "Login successful" });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}