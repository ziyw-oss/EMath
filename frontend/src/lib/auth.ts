import { NextApiRequest } from "next";
import jwt, { JwtPayload } from "jsonwebtoken";

export function getCurrentUser(req: NextApiRequest) {
  try {
    const token = req.cookies.token;
    if (!token) return null;
    const user = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload & { id: number };
    return user;
  } catch (err) {
    return null;
  }
}

export async function getUserFromRequest(req: NextApiRequest) {
  return getCurrentUser(req);
}