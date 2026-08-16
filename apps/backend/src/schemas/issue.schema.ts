import { z } from "zod";

export const createIssueSchema = z.object({
  title: z.string().trim().min(1, "Issue title is required").max(150),
  description: z.string().trim().max(2000).optional().default(""),
  sectionId: z.string().uuid("sectionId must be a valid id"),
  boardId: z.string().uuid("boardId must be a valid id"),
});
export type CreateIssueInput = z.infer<typeof createIssueSchema>;

export const updateIssueSchema = z
  .object({
    issueId: z.string().uuid("issueId must be a valid id"),
    title: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(2000).optional(),
  })
  .refine((data) => data.title !== undefined || data.description !== undefined, {
    message: "At least one of title or description must be provided",
  });
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;

export const deleteIssueSchema = z.object({
  issueId: z.string().uuid("issueId must be a valid id"),
});

export const listIssuesQuerySchema = z
  .object({
    sectionId: z.string().uuid().optional(),
    boardId: z.string().uuid().optional(),
  })
  .refine((data) => data.sectionId ?? data.boardId, {
    message: "Either sectionId or boardId query parameter is required",
  });

export const assignIssueSchema = z.object({
  issueId: z.string().uuid("issueId must be a valid id"),
  userId: z.string().uuid("userId must be a valid id"),
});
export type AssignIssueInput = z.infer<typeof assignIssueSchema>;
