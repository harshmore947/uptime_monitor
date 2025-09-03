import express, { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth";

const app = Router();

// Public routes
app.post("/auth/register", registerUser);
app.post("/auth/login", loginUser);
app.post("/auth/logout", logoutUser);
app.post("/auth/forgot-password", forgotPassword);
app.post("/auth/reset-password", resetPassword);

// Protected routes (require authentication)
app.get("/auth/me", authMiddleware, getCurrentUser);
app.put("/auth/me", authMiddleware, updateUserProfile);

export default app;
