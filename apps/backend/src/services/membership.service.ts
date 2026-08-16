import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import type { InviteInput } from "../schemas/membership.schema.js";

export async function inviteMember(input: InviteInput) {
  const org = await prisma.organisation.findUnique({ where: { id: input.orgId } });
  if (!org) throw AppError.notFound("Organisation not found");

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw AppError.notFound("No user is registered with this email");

  const existing = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: user.id, orgId: input.orgId } },
  });
  if (existing) throw AppError.conflict("User is already a member of this organisation");

  return prisma.membership.create({
    data: { userId: user.id, orgId: input.orgId, role: "MEMBER" },
  });
}

/**
 * NOTE: in a production system this would validate a real invite token
 * rather than membership already existing. Kept close to the original
 * "direct-add" invite flow here, exposed as a separate endpoint so the
 * invited user can explicitly confirm they're joining.
 */
export async function acceptInvite(userId: string, orgId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId, orgId } },
  });

  if (!membership) {
    throw AppError.notFound("No invite found for this organisation");
  }

  return membership;
}

export async function getMembers(orgId: string) {
  const org = await prisma.organisation.findUnique({ where: { id: orgId } });
  if (!org) throw AppError.notFound("Organisation not found");

  const memberships = await prisma.membership.findMany({
    where: { orgId },
    include: {
      user: {
        select: { id: true, username: true, email: true },
      },
    },
  });

  return memberships.map((m) => ({
    id: m.id,
    userId: m.userId,
    username: m.user.username,
    email: m.user.email,
    role: m.role,
  }));
}

export async function removeMembership(orgId: string, targetUserId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: targetUserId, orgId } },
  });

  if (!membership) {
    throw AppError.notFound("Membership not found");
  }

  if (membership.role === "ADMIN") {
    const adminCount = await prisma.membership.count({
      where: { orgId, role: "ADMIN" },
    });

    if (adminCount === 1) {
      throw AppError.badRequest("Cannot remove the last admin of the organisation");
    }
  }

  await prisma.membership.delete({ where: { id: membership.id } });
}
