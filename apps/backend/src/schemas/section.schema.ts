import { z } from "zod";

export const createSectionSchema = z.object({
  title: z.string().trim().min(1, "Section title is required").max(100),
  boardId: z.string().uuid("boardId must be a valid id"),
});
export type CreateSectionInput = z.infer<typeof createSectionSchema>;

export const updateSectionSchema = z.object({
  sectionId: z.string().uuid("sectionId must be a valid id"),
  title: z.string().trim().min(1, "Section title is required").max(100),
});
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;

export const deleteSectionSchema = z.object({
  sectionId: z.string().uuid("sectionId must be a valid id"),
});
export type DeleteSectionInput = z.infer<typeof deleteSectionSchema>;

export const listSectionsQuerySchema = z.object({
  boardId: z.string().uuid("boardId must be a valid id"),
});
