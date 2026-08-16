import { z } from "zod";

export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  orgId: z.string().uuid("orgId must be a valid id"),
});
export type InviteInput = z.infer<typeof inviteSchema>;

export const acceptSchema = z.object({
  orgId: z.string().uuid("orgId must be a valid id"),
});
export type AcceptInput = z.infer<typeof acceptSchema>;

export const deleteMembershipSchema = z.object({
  userId: z.string().uuid("userId must be a valid id"),
  orgId: z.string().uuid("orgId must be a valid id"),
});
export type DeleteMembershipInput = z.infer<typeof deleteMembershipSchema>;
