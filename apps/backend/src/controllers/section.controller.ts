import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { created, ok } from "../utils/response.js";
import * as sectionService from "../services/section.service.js";
import { AppError } from "../utils/AppError.js";

export const createSection = catchAsync(async (req: Request, res: Response) => {
  const section = await sectionService.createSection(req.userId, req.body);
  created(res, section);
});

export const listSections = catchAsync(async (req: Request, res: Response) => {
  const boardId = req.query.boardId as string;
  if (!boardId) throw AppError.badRequest("boardId query parameter is required");
  const sections = await sectionService.listSections(boardId, req.userId);
  ok(res, sections);
});

export const updateSection = catchAsync(async (req: Request, res: Response) => {
  const section = await sectionService.updateSection(req.userId, req.body);
  ok(res, section);
});

export const deleteSection = catchAsync(async (req: Request, res: Response) => {
  const { sectionId } = req.body;
  if (!sectionId) throw AppError.badRequest("sectionId is required");
  await sectionService.deleteSection(req.userId, sectionId);
  ok(res, { message: "Section deleted successfully" });
});
