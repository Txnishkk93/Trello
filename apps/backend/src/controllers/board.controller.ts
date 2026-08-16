import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { created, ok } from "../utils/response.js";
import * as boardService from "../services/board.service.js";
import { AppError } from "../utils/AppError.js";

export const createBoard = catchAsync(async (req: Request, res: Response) => {
  const board = await boardService.createBoard(req.body);
  created(res, board);
});

export const listBoards = catchAsync(async (req: Request, res: Response) => {
  const orgId = req.query.orgId as string;
  const boards = await boardService.listBoards(orgId, req.userId);
  ok(res, boards);
});

export const updateBoard = catchAsync(async (req: Request, res: Response) => {
  const board = await boardService.updateBoard(req.userId, req.body);
  ok(res, board);
});

export const deleteBoard = catchAsync(async (req: Request, res: Response) => {
  const { boardId } = req.body;
  if (!boardId) throw AppError.badRequest("boardId is required");
  await boardService.deleteBoard(req.userId, boardId);
  ok(res, { message: "Board deleted successfully" });
});
