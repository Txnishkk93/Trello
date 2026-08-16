import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { created, ok } from "../utils/response.js";
import * as membershipService from "../services/membership.service.js";

export const getMembers = catchAsync(async (req: Request, res: Response) => {
  const members = await membershipService.getMembers(req.query.orgId as string);
  ok(res, members);
});

export const invite = catchAsync(async (req: Request, res: Response) => {
  const membership = await membershipService.inviteMember(req.body);
  created(res, membership);
});

export const accept = catchAsync(async (req: Request, res: Response) => {
  const membership = await membershipService.acceptInvite(req.userId, req.body.orgId);
  ok(res, { message: "Organisation accepted", membership });
});

export const removeMembership = catchAsync(async (req: Request, res: Response) => {
  await membershipService.removeMembership(req.body.orgId, req.body.userId);
  ok(res, { message: "Member removed successfully" });
});
