import { z } from "zod";

export const createOrgSchema = z.object({
  username: z.string().trim().min(1, "Organisation name is required").max(50),
  description: z.string().trim().max(500).optional().default(""),
});
export type CreateOrgInput = z.infer<typeof createOrgSchema>;

export const deleteOrgSchema = z.object({
  orgId: z.string().uuid("orgId must be a valid id"),
});
export type DeleteOrgInput = z.infer<typeof deleteOrgSchema>;
