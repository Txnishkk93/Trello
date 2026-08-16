import { z } from "zod";

export const createBoardSchema = z.object({
  title: z.string().trim().min(1, "Board title is required").max(100),
  orgId: z.string().uuid("orgId must be a valid id"),
});
export type CreateBoardInput = z.infer<typeof createBoardSchema>;

export const updateBoardSchema = z.object({
  boardId: z.string().uuid("boardId must be a valid id"),
  title: z.string().trim().min(1, "Board title is required").max(100),
});
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;

export const deleteBoardSchema = z.object({
  boardId: z.string().uuid("boardId must be a valid id"),
});
export type DeleteBoardInput = z.infer<typeof deleteBoardSchema>;

export const listBoardsQuerySchema = z.object({
  orgId: z.string().uuid("orgId must be a valid id"),
});
