import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET ?? process.env.JWT_SCERET;

export async function authMiddleware(
  req: any,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Missing or invalid token",
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded: any = jwt.verify(token, jwtSecret);
      req.userId = decoded.userId;
      next();
    } catch (error) {
      return res.status(401).json({
        error: "Invalid token",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
