import { Router } from "express";
import { register, login, getProfile, updateProfile, changePassword, deleteAccount } from "../controllers/authController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticate, getProfile);
router.patch("/profile", authenticate, updateProfile);
router.patch("/password", authenticate, changePassword);
router.delete("/account", authenticate, deleteAccount);

export default router;
