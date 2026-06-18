import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token) as {
      id?: string | number;
      email: string;
      username?: string;
      role?: string;
    };

    req.user = {
      id: String(decoded.id ?? ""),
      email: decoded.email,
      username: decoded.username ?? decoded.email.split("@")[0],
      role: decoded.role ?? "learner",
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
