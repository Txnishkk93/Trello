import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { created, ok } from "../utils/response.js";
import * as authService from "../services/auth.service.js";

export const signup = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.signup(req.body);
  created(res, user);
});

export const signin = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.signin(req.body);
  ok(res, result);
});
