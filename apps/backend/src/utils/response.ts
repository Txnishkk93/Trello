import type { Response } from "express";

/**
 * Small helpers to keep response shape consistent across every endpoint:
 * { success: true, data: ... } for happy paths.
 * Errors are handled separately by the error middleware.
 */
export const ok = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data });

export const created = (res: Response, data: unknown) => ok(res, data, 201);
