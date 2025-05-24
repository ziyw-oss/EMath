import { NextApiRequest } from "next";
import jwt from "jsonwebtoken";

export function getCurrentUser(req: NextApiRequest) {
  try {
    const token = req.cookies.token;
    if (!token) return null;
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    return user;
  } catch (err) {
    return null;
  }
}