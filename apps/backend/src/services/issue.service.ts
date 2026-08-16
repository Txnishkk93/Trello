import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import { assertBoardAccess } from "./board.service.js";
import { assertSectionAccess } from "./section.service.js";
import type {
  AssignIssueInput,
  CreateIssueInput,
  UpdateIssueInput,
} from "../schemas/issue.schema.js";

async function assertIssueAccess(issueId: string, userId: string) {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { section: { include: { board: true } } },
  });
  if (!issue) throw AppError.notFound("Issue not found");

  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId, orgId: issue.section.board.orgId } },
  });
  if (!membership) throw AppError.forbidden("You don't have access to this issue");

  return issue;
}

export async function createIssue(userId: string, input: CreateIssueInput) {
  const section = await assertSectionAccess(input.sectionId, userId);

  if (section.boardId !== input.boardId) {
    throw AppError.badRequest("sectionId does not belong to the given boardId");
  }

  return prisma.issue.create({
    data: {
      title: input.title,
      description: input.description ?? "",
      sectionId: input.sectionId,
      boardId: input.boardId,
    },
    include: { issueMappings: { include: { user: { select: { id: true, username: true } } } } },
  });
}

export async function listIssues(
  userId: string,
  filter: { sectionId?: string; boardId?: string }
) {
  if (filter.sectionId) {
    await assertSectionAccess(filter.sectionId, userId);
    return prisma.issue.findMany({
      where: { sectionId: filter.sectionId },
      include: { issueMappings: { include: { user: { select: { id: true, username: true } } } } },
      orderBy: { createdAt: "asc" },
    });
  }

  // filter.boardId is guaranteed by the query schema's refine() when
  // sectionId is absent.
  await assertBoardAccess(filter.boardId as string, userId);
  return prisma.issue.findMany({
    where: { section: { boardId: filter.boardId } },
    include: { issueMappings: { include: { user: { select: { id: true, username: true } } } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getIssueById(userId: string, issueId: string) {
  const issue = await assertIssueAccess(issueId, userId);
  return prisma.issue.findUniqueOrThrow({
    where: { id: issue.id },
    include: { issueMappings: { include: { user: { select: { id: true, username: true } } } } },
  });
}

export async function updateIssue(userId: string, input: UpdateIssueInput) {
  await assertIssueAccess(input.issueId, userId);

  return prisma.issue.update({
    where: { id: input.issueId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
    },
    include: { issueMappings: { include: { user: { select: { id: true, username: true } } } } },
  });
}

export async function deleteIssue(userId: string, issueId: string) {
  await assertIssueAccess(issueId, userId);
  // Cascading delete on IssueMapping is declared in the schema.
  await prisma.issue.delete({ where: { id: issueId } });
}

/** Assigns an org member to an issue (creates an IssueMapping row). */
export async function assignIssue(userId: string, input: AssignIssueInput) {
  const issue = await assertIssueAccess(input.issueId, userId);

  const targetMembership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId: input.userId, orgId: issue.section.board.orgId } },
  });
  if (!targetMembership) {
    throw AppError.badRequest("Target user is not a member of this organisation");
  }

  const existing = await prisma.issueMapping.findUnique({
    where: { userId_issueId: { userId: input.userId, issueId: input.issueId } },
  });
  if (existing) throw AppError.conflict("User is already assigned to this issue");

  return prisma.issueMapping.create({
    data: { userId: input.userId, issueId: input.issueId },
  });
}

export async function unassignIssue(userId: string, issueId: string, targetUserId: string) {
  await assertIssueAccess(issueId, userId);

  const mapping = await prisma.issueMapping.findUnique({
    where: { userId_issueId: { userId: targetUserId, issueId } },
  });
  if (!mapping) throw AppError.notFound("Assignment not found");

  await prisma.issueMapping.delete({ where: { id: mapping.id } });
}
