import type { Request, Response } from "express";
import { User } from "../model/user-model";
import jwt from "jsonwebtoken";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "password must be at least 6 characters"),
  name: z.string().min(2, "name must be at least 2 characters").optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "password must be at least 6 characters"),
});

const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  password: z
    .string()
    .min(6, "password must be at least 6 characters")
    .optional(),
  name: z.string().min(2, "name must be at least 2 characters").optional(),
  settings: z
    .object({
      notification: z
        .object({
          email: z.boolean().optional(),
          slack: z.boolean().optional(),
          discord: z.boolean().optional(),
        })
        .optional(),
      timezone: z.string().optional(),
    })
    .optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "password must be at least 6 characters"),
});

export const registerUser = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        msg: "invalid input",
        errors: parsed.error.flatten(),
        success: false,
      });
    }

    const { email, password, name } = parsed.data;

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(409).json({
        msg: "user already exists, please try with a new email",
        success: false,
      });
    }

    const newUser = new User({
      email,
      password, // Password will be hashed by pre-save hook
      name: name || email.split("@")[0], // Use name or extract from email
      plan: "starter",
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.SECRET as string, {
      expiresIn: "7d",
    });

    return res.status(201).json({ msg: "user created", token, success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "internal server error", success: false });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        msg: "invalid input",
        errors: parsed.error.flatten(),
        success: false,
      });
    }

    const { email, password } = parsed.data;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ msg: "invalid credentials", success: false });
    }

    const ok = await user.comparePassword(password); // Use model method
    if (!ok) {
      return res
        .status(401)
        .json({ msg: "invalid credentials", success: false });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET as string, {
      expiresIn: "7d",
    });

    return res
      .status(200)
      .json({ msg: "login successful", token, success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "error logging in user", success: false });
  }
};

// POST /api/auth/logout - Logout user (simple implementation)
export const logoutUser = async (req: Request, res: Response) => {
  try {
    // In a simple JWT implementation, logout is handled client-side by removing the token
    // For more security, you could implement token blacklisting here
    return res.status(200).json({
      msg: "logout successful",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "error logging out user",
      success: false,
    });
  }
};

// GET /api/auth/me - Get current user profile
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user;
    if (!userId) {
      return res.status(401).json({
        msg: "user not authenticated",
        success: false,
      });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        msg: "user not found",
        success: false,
      });
    }

    return res.status(200).json({
      msg: "user profile fetched successfully",
      user,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "error fetching user profile",
      success: false,
    });
  }
};

// PUT /api/auth/me - Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user;
    if (!userId) {
      return res.status(401).json({
        msg: "user not authenticated",
        success: false,
      });
    }

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        msg: "invalid input",
        errors: parsed.error.flatten(),
        success: false,
      });
    }

    const { email, password, name, settings } = parsed.data;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        msg: "user not found",
        success: false,
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          msg: "email already exists",
          success: false,
        });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (password) user.password = password; // Will be hashed by pre-save hook

    // Update settings if provided
    if (settings) {
      if (settings.notification) {
        if (settings.notification.email !== undefined) {
          user.settings.notification.email = settings.notification.email;
        }
        if (settings.notification.slack !== undefined) {
          user.settings.notification.slack = settings.notification.slack;
        }
        if (settings.notification.discord !== undefined) {
          user.settings.notification.discord = settings.notification.discord;
        }
      }
      if (settings.timezone) {
        user.settings.timezone = settings.timezone;
      }
    }

    await user.save();

    const updatedUser = await User.findById(userId).select("-password");
    return res.status(200).json({
      msg: "profile updated successfully",
      user: updatedUser,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "error updating profile",
      success: false,
    });
  }
};

// POST /api/auth/forgot-password - Send password reset email
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        msg: "invalid input",
        errors: parsed.error.flatten(),
        success: false,
      });
    }

    const { email } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return res.status(200).json({
        msg: "if email exists, reset link has been sent",
        success: true,
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to user (you'll need to add these fields to user model)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await sendPasswordResetEmail(email, resetUrl);

    console.log(`Password reset token for ${email}: ${resetToken}`); // For testing

    return res.status(200).json({
      msg: "if email exists, reset link has been sent",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "error processing password reset",
      success: false,
    });
  }
};

// POST /api/auth/reset-password - Reset password using token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        msg: "invalid input",
        errors: parsed.error.flatten(),
        success: false,
      });
    }

    const { token, password } = parsed.data;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        msg: "invalid or expired reset token",
        success: false,
      });
    }

    // Update password and clear reset token
    user.password = password; // Will be hashed by pre-save hook
    user.resetPasswordToken = "";
    user.resetPasswordExpires = new Date(0);
    await user.save();

    return res.status(200).json({
      msg: "password reset successful",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "error resetting password",
      success: false,
    });
  }
};
