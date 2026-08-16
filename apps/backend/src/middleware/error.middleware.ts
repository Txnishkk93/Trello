import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

/**
 * Single place that turns any thrown/forwarded error into a JSON response.
 * Must be registered LAST, after all routes, and takes 4 args so Express
 * recognises it as an error handler.
 */
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Known, expected errors (validation, auth, not found, etc.)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Prisma-specific errors get translated into meaningful HTTP responses
  // instead of leaking a raw 500 + stack trace to the client.
  if (
    err &&
    typeof err === "object" &&
    "code" in err &&
    "meta" in err &&
    typeof (err as any).code === "string"
  ) {
    const prismaErr = err as any;
    if (prismaErr.code === "P2002") {
      const target = (prismaErr.meta?.target as string[] | undefined)?.join(", ") ?? "field";
      return res.status(409).json({
        success: false,
        error: `A record with this ${target} already exists`,
      });
    }
    if (prismaErr.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }
  }

  // Unexpected/programmer errors: log full detail server-side,
  // but never leak internals to the client.
  console.error("Unhandled error:", err);

  return res.status(500).json({
    success: false,
    error: env.NODE_ENV === "development" && err instanceof Error ? err.message : "Internal server error",
  });
}
