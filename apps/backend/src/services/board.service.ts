import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import type { CreateBoardInput, UpdateBoardInput } from "../schemas/board.schema.js";

async function assertBoardAccess(boardId: string, userId: string) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) throw AppError.notFound("Board not found");

  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId, orgId: board.orgId } },
  });
  if (!membership) throw AppError.forbidden("You don't have access to this board");

  return board;
}

export async function createBoard(input: CreateBoardInput) {
  return prisma.board.create({ data: { title: input.title, orgId: input.orgId } });
}

export async function listBoards(orgId: string, userId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId, orgId } },
  });
  if (!membership) throw AppError.forbidden("You are not a member of this organisation");

  return prisma.board.findMany({ where: { orgId }, orderBy: { createdAt: "desc" } });
}

export async function updateBoard(userId: string, input: UpdateBoardInput) {
  await assertBoardAccess(input.boardId, userId);

  return prisma.board.update({
    where: { id: input.boardId },
    data: { title: input.title },
  });
}

export async function deleteBoard(userId: string, boardId: string) {
  await assertBoardAccess(boardId, userId);

  // Cascading deletes on Section/Issue/IssueMapping are declared in the
  // schema, so this single delete cleans up the whole subtree safely.
  await prisma.board.delete({ where: { id: boardId } });
}

export { assertBoardAccess };
