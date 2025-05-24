import { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [rows]: any[] = await db.query(
      "SELECT id, paper_code, paper_name FROM exam_papers ORDER BY created_at DESC"
    );
    res.status(200).json(rows);
  } catch (err: any) {
    console.error("Failed to load papers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}