import type { NextFunction, Request, Response } from "express";

/**
 * Wraps an async route handler so any rejected promise / thrown error
 * is forwarded to next(), reaching the central error middleware instead
 * of crashing the process or requiring a try/catch in every controller.
 */
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const catchAsync = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
