import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";

/**
 * Verifies the Bearer token on protected routes and attaches `req.userId`.
 * Any failure (missing header, malformed/expired token) becomes a 401 —
 * never a 500 — since these are client errors, not server bugs.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Missing or malformed Authorization header"));
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    return next(AppError.unauthorized("Invalid or expired token"));
  }
}
