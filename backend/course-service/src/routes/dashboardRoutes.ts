import { Router } from "express";
import * as dashboardController from "../controllers/dashboardController";

const router = Router();

router.get("/user/:userId", dashboardController.getUserDashboard);

export default router;
