import { Response, NextFunction } from "express";
import { prisma } from "db/client";

export async function requireOrgMember(
  req: any,
  res: Response,
  next: NextFunction
) {
  try {
    const { orgId } = req.body;

    if (!orgId) {
      return res.status(400).json({
        error: "orgId is required",
      });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.userId,
        orgId: orgId,
      },
    });

    if (!membership) {
      return res.status(403).json({
        error: "You are not a member of this organization",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function requireOrgAdmin(
  req: any,
  res: Response,
  next: NextFunction
) {
  try {
    const { orgId } = req.body;

    if (!orgId) {
      return res.status(400).json({
        error: "orgId is required",
      });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.userId,
        orgId: orgId,
        role: "ADMIN",
      },
    });

    if (!membership) {
      return res.status(403).json({
        error: "Only admins can perform this action",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
