import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { created, ok } from "../utils/response.js";
import * as issueService from "../services/issue.service.js";

export const createIssue = catchAsync(async (req: Request, res: Response) => {
  const issue = await issueService.createIssue(req.userId, req.body);
  created(res, issue);
});

export const listIssues = catchAsync(async (req: Request, res: Response) => {
  const { sectionId, boardId } = req.query as { sectionId?: string; boardId?: string };
  const issues = await issueService.listIssues(req.userId, { sectionId, boardId });
  ok(res, issues);
});

export const getIssue = catchAsync(async (req: Request, res: Response) => {
  const issue = await issueService.getIssueById(req.userId, req.params.issueId as string);
  ok(res, issue);
});

export const updateIssue = catchAsync(async (req: Request, res: Response) => {
  const issue = await issueService.updateIssue(req.userId, req.body);
  ok(res, issue);
});

export const deleteIssue = catchAsync(async (req: Request, res: Response) => {
  await issueService.deleteIssue(req.userId, req.params.issueId as string);
  ok(res, { message: "Issue deleted successfully" });
});

export const assignIssue = catchAsync(async (req: Request, res: Response) => {
  const mapping = await issueService.assignIssue(req.userId, req.body);
  created(res, mapping);
});

export const unassignIssue = catchAsync(async (req: Request, res: Response) => {
  await issueService.unassignIssue(
    req.userId,
    req.params.issueId as string,
    req.params.userId as string
  );
  ok(res, { message: "User unassigned from issue" });
});
