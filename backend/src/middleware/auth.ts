import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

// Extend the Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: string;
    }
  }
}

interface JwtPayload {
  id: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ msg: "not authenticated/ invalid token" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "token not provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET as string) as JwtPayload;
    req.user = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ msg: "invalid token or expired token" });
  }
};