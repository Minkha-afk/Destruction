import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { userId: string; username: string; email: string };
}

// Accept tokens issued by auth-service: payload shape { id, email }
// Backwards compatibility: if token already contains userId/username, map accordingly.
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"]; 
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;

  if (!token) return res.status(401).json({ message: "No token provided" });

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("[AUTH] JWT_SECRET missing in chat-service environment");
    return res.status(500).json({ message: "Server misconfiguration: missing JWT_SECRET" });
  }

  try {
    const decoded: any = jwt.verify(token, secret);
    // Normalize fields
    let userId: string | undefined;
    let email: string | undefined;
    let username: string | undefined;

    if (decoded) {
      if (decoded.id) userId = decoded.id.toString();
      if (decoded.email) email = decoded.email;
      if (decoded.userId) userId = decoded.userId.toString();
      if (decoded.username) username = decoded.username;
    }

    if (!username && email) {
      username = email.split('@')[0];
    }

    if (!userId || !username) {
      return res.status(403).json({ message: "Token payload missing required fields" });
    }

    req.user = { userId, username, email: email || username + "@unknown" };
    next();
  } catch (err: any) {
    console.error("[AUTH] Token verification failed", err?.message || err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};