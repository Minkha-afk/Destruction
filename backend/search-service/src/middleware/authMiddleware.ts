import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// ============================================================================
// AUTH MIDDLEWARE - CATALOG SERVICE
// Protects course-management (write) routes. Tokens are issued by auth-service
// and share the same JWT_SECRET across services.
// ============================================================================

export interface AuthRequest extends Request {
  user?: { id: string; email: string; username: string; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("[catalog-service] JWT_SECRET is not set; cannot authenticate requests");
    return res.status(500).json({ error: "Server misconfiguration: missing JWT_SECRET" });
  }

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], secret) as {
      id?: string | number;
      email?: string;
      username?: string;
      role?: string;
    };

    req.user = {
      id: String(decoded.id ?? ""),
      email: decoded.email ?? "",
      username: decoded.username ?? decoded.email?.split("@")[0] ?? "",
      role: (decoded.role ?? "learner").toLowerCase(),
    };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Optionally require the TEACHER role for course management.
 * Enabled only when REQUIRE_TEACHER_ROLE=true so single-user/dev setups keep
 * working, while production can lock content authoring down to teachers.
 */
export const requireTeacher = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (process.env.REQUIRE_TEACHER_ROLE !== "true") return next();
  if (req.user?.role !== "teacher") {
    return res.status(403).json({ error: "Only teachers can manage courses" });
  }
  next();
};
