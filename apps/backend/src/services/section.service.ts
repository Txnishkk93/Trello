import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import { assertBoardAccess } from "./board.service.js";
import type { CreateSectionInput, UpdateSectionInput } from "../schemas/section.schema.js";

async function assertSectionAccess(sectionId: string, userId: string) {
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: { board: true },
  });
  if (!section) throw AppError.notFound("Section not found");

  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId, orgId: section.board.orgId } },
  });
  if (!membership) throw AppError.forbidden("You don't have access to this section");

  return section;
}

export async function createSection(userId: string, input: CreateSectionInput) {
  await assertBoardAccess(input.boardId, userId);

  return prisma.section.create({
    data: { title: input.title, boardId: input.boardId },
  });
}

export async function listSections(boardId: string, userId: string) {
  await assertBoardAccess(boardId, userId);

  return prisma.section.findMany({ where: { boardId }, orderBy: { createdAt: "asc" } });
}

export async function updateSection(userId: string, input: UpdateSectionInput) {
  await assertSectionAccess(input.sectionId, userId);

  return prisma.section.update({
    where: { id: input.sectionId },
    data: { title: input.title },
  });
}

export async function deleteSection(userId: string, sectionId: string) {
  await assertSectionAccess(sectionId, userId);

  // Cascading deletes on Issue/IssueMapping are declared in the schema.
  await prisma.section.delete({ where: { id: sectionId } });
}

export { assertSectionAccess };
