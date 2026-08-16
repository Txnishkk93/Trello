import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

/**
 * Resolves the target organisation id from the request. Most write routes
 * carry it in the body; a couple of read routes carry it as a query param.
 */
function resolveOrgId(req: Request): string | undefined {
  return (req.body?.orgId as string | undefined) ?? (req.query?.orgId as string | undefined);
}

/** Requires the caller to hold ANY membership (admin or member) in the org. */
export const requireOrgMember = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const orgId = resolveOrgId(req);
    if (!orgId) return next(AppError.badRequest("orgId is required"));

    const membership = await prisma.membership.findUnique({
      where: { userId_orgId: { userId: req.userId, orgId } },
    });

    if (!membership) {
      return next(AppError.forbidden("You are not a member of this organisation"));
    }

    next();
  }
);

/** Requires the caller to hold the ADMIN role in the org. */
export const requireOrgAdmin = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const orgId = resolveOrgId(req);
    if (!orgId) return next(AppError.badRequest("orgId is required"));

    const membership = await prisma.membership.findUnique({
      where: { userId_orgId: { userId: req.userId, orgId } },
    });

    if (!membership || membership.role !== "ADMIN") {
      return next(AppError.forbidden("Only an organisation admin can perform this action"));
    }

    next();
  }
);
