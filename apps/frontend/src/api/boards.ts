import { request } from "./client";
import type { Board, Section, Issue } from "../types";

// Boards
export function createBoard(title: string, orgId: string) {
  return request<Board>("/boards", { method: "POST", body: { title, orgId } });
}

export function listBoards(orgId: string) {
  return request<Board[]>("/boards", { query: { orgId } });
}

export function updateBoard(boardId: string, title: string) {
  return request<Board>("/boards", { method: "PUT", body: { boardId, title } });
}

export function deleteBoard(boardId: string) {
  return request<{ message: string }>("/boards", { method: "DELETE", body: { boardId } });
}

// Sections
export function createSection(title: string, boardId: string) {
  return request<Section>("/sections", { method: "POST", body: { title, boardId } });
}

export function listSections(boardId: string) {
  return request<Section[]>("/sections", { query: { boardId } });
}

export function updateSection(sectionId: string, title: string) {
  return request<Section>("/sections", { method: "PUT", body: { sectionId, title } });
}

export function deleteSection(sectionId: string) {
  return request<{ message: string }>("/sections", { method: "DELETE", body: { sectionId } });
}

// Issues
export function createIssue(title: string, sectionId: string, boardId: string, description?: string) {
  return request<Issue>("/issues", { method: "POST", body: { title, description, sectionId, boardId } });
}

export function listIssuesBySection(sectionId: string) {
  return request<Issue[]>("/issues", { query: { sectionId } });
}

export function listIssuesByBoard(boardId: string) {
  return request<Issue[]>("/issues", { query: { boardId } });
}

export function getIssue(issueId: string) {
  return request<Issue>(`/issues/${issueId}`);
}

export function updateIssue(issueId: string, fields: { title?: string; description?: string }) {
  return request<Issue>("/issues", { method: "PUT", body: { issueId, ...fields } });
}

export function deleteIssue(issueId: string) {
  return request<{ message: string }>(`/issues/${issueId}`, { method: "DELETE" });
}

// Issue Assignments
export function assignIssue(issueId: string, userId: string) {
  return request<IssueMapping>("/issues/assign", {
    method: "POST",
    body: { issueId, userId },
  });
}

export function unassignIssue(issueId: string, userId: string) {
  return request<{ message: string }>(`/issues/${issueId}/assign/${userId}`, {
    method: "DELETE",
  });
}

export interface IssueMapping {
  id: string;
  userId: string;
  issueId: string;
  user: {
    id: string;
    username: string;
  };
}
