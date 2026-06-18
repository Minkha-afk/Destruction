import { Router } from "express";
import { fetchMessages, getChannels, getOnlineUsers, postMessage } from "../controllers/chatController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/channels", authMiddleware, getChannels);
router.get("/:courseId/messages", authMiddleware, fetchMessages);
router.post("/:courseId/messages", authMiddleware, postMessage);
router.get("/:courseId/online-users", authMiddleware, getOnlineUsers);

export default router;
