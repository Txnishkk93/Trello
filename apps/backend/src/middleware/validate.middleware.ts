import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError.js";

/**
 * Validates and REPLACES req.body with the parsed result, so downstream
 * handlers get trimmed/coerced, type-safe data instead of raw user input.
 */
export const validateBody = (schema: ZodType) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
        .join("; ");
      return next(AppError.badRequest(message));
    }

    req.body = result.data;
    next();
  };
};

/** Same idea, but for query string params (e.g. GET /boards?orgId=...). */
export const validateQuery = (schema: ZodType) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".") || "query"}: ${issue.message}`)
        .join("; ");
      return next(AppError.badRequest(message));
    }

    req.query = result.data as typeof req.query;
    next();
  };
};
