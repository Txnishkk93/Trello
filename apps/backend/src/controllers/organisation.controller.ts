import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { created, ok } from "../utils/response.js";
import * as orgService from "../services/organisation.service.js";

export const createOrganisation = catchAsync(async (req: Request, res: Response) => {
  const org = await orgService.createOrganisation(req.userId, req.body);
  created(res, org);
});

export const listOrganisations = catchAsync(async (req: Request, res: Response) => {
  const orgs = await orgService.listOrganisationsForUser(req.userId);
  ok(res, orgs);
});

export const deleteOrganisation = catchAsync(async (req: Request, res: Response) => {
  await orgService.deleteOrganisation(req.body.orgId);
  ok(res, { message: "Organisation deleted successfully" });
});
