import express from "express";

import { authMiddleware } from "../middleware/auth";
import { createStatusPage, deleteStatusPage, getPublicStatusPage, getStatusPageById, getUserStatusPage, updateStatusPage } from "../controllers/status.controller";

const router = express.Router();

// Protected routes (require authentication)
router.get("/", authMiddleware, getUserStatusPage);
router.post("/", authMiddleware, createStatusPage);
router.get("/:id", authMiddleware, getStatusPageById);
router.put("/:id", authMiddleware, updateStatusPage);
router.delete("/:id", authMiddleware, deleteStatusPage);

// Public route (no auth required)
router.get("/public/:slug", getPublicStatusPage); // Note: Adjusted path to avoid conflict; use /api/status/:slug in main app

export default router;
