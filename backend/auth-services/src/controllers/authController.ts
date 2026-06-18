import { Request, Response } from "express";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { signToken } from "../utils/jwt";
import User from "../models/User";
import type { AuthRequest } from "../middlewares/authMiddleware";

// Basic email shape check — good enough to reject obvious typos without being
// overly strict (full RFC validation is famously brittle).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

// Emails are case-insensitive in practice. Normalize on the way in so that
// "User@x.com" and "user@x.com" resolve to the same account on both register
// and login (the column has a UNIQUE index).
const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const normalizedEmail = normalizeEmail(String(email));
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    if (role && !["learner", "teacher"].includes(String(role).toLowerCase())) {
      return res.status(400).json({ message: "role must be 'learner' or 'teacher'" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered. Please login instead." });
    }

    const hashed = await hashPassword(password);
    const userRole = String(role).toLowerCase() === "teacher" ? "teacher" : "learner";

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashed,
      role: userRole,
    });

    // Sign a token so the frontend can auto-login immediately after registration
    const token = signToken({ id: user._id, email: user.email, username: user.name, role: user.role });

    res.status(201).json({ message: "User registered", user: user.toJSON(), token });
  } catch (err: any) {
    console.error("Register error", err);
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Email already registered. Please login instead." });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = normalizeEmail(String(email));
    const user = await User.findOne({ email: normalizedEmail });

    // Use a single generic message for both "no such user" and "wrong password"
    // so the endpoint can't be used to enumerate which emails are registered.
    const invalid = () => res.status(401).json({ message: "Invalid email or password" });
    if (!user) return invalid();

    const valid = await comparePassword(password, user.password);
    if (!valid) return invalid();

    const token = signToken({ id: user._id, email: user.email, username: user.name, role: user.role });
    res.json({ token, user: user.toJSON() });
  } catch (err: any) {
    console.error("Login error", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user: user.toJSON() });
  } catch (err) {
    console.error("getProfile error", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { name } = req.body as { name?: string };

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "User not found" });

    // Issue a fresh token so the frontend immediately reflects the new name
    const token = signToken({
      id: updated._id,
      email: updated.email,
      username: updated.name,
      role: updated.role,
    });

    res.json({ user: updated.toJSON(), token });
  } catch (err) {
    console.error("updateProfile error", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) return res.status(401).json({ message: "Current password is incorrect" });

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("changePassword error", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { password } = req.body as { password?: string };
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ message: "Password is incorrect" });

    await user.deleteOne();
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("deleteAccount error", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
