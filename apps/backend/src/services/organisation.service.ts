import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import type { CreateOrgInput } from "../schemas/organisation.schema.js";

export async function createOrganisation(userId: string, input: CreateOrgInput) {
  const existing = await prisma.organisation.findUnique({
    where: { username: input.username },
    select: { id: true },
  });

  if (existing) {
    throw AppError.conflict("An organisation with this name already exists");
  }

  // Creating the org and the creator's ADMIN membership must succeed or
  // fail together — an org with no admin (or an admin with no membership
  // row) would be a broken, unrecoverable state.
  const { org } = await prisma.$transaction(async (tx) => {
    const org = await tx.organisation.create({
      data: {
        username: input.username,
        description: input.description,
        adminId: userId,
      },
    });

    const membership = await tx.membership.create({
      data: { userId, orgId: org.id, role: "ADMIN" },
    });

    return { org, membership };
  });

  return org;
}

export async function listOrganisationsForUser(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: { org: true },
    orderBy: { createdAt: "desc" },
  });

  return memberships.map((m) => ({
    id: m.org.id,
    username: m.org.username,
    description: m.org.description,
    role: m.role,
  }));
}

export async function deleteOrganisation(orgId: string) {
  const org = await prisma.organisation.findUnique({ where: { id: orgId } });
  if (!org) {
    throw AppError.notFound("Organisation not found");
  }

  // Cascading deletes are declared in the Prisma schema (onDelete: Cascade),
  // so removing the organisation is enough — Prisma/Postgres handles
  // boards, sections, issues, memberships and issue mappings underneath it.
  await prisma.organisation.delete({ where: { id: orgId } });
}
