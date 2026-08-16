import { request } from "./client";
import type { Organization } from "../types";

export function createOrg(username: string, description?: string) {
  return request<Organization>("/organisations", { method: "POST", body: { username, description } });
}

export function listOrgs() {
  return request<Organization[]>("/organisations");
}

export function deleteOrg(orgId: string) {
  return request<{ message: string }>("/organisations", { method: "DELETE", body: { orgId } });
}

export interface Member {
  id: string;
  userId: string;
  username: string;
  email: string;
  role: "ADMIN" | "MEMBER";
}

export function listMembers(orgId: string) {
  return request<Member[]>("/memberships", { method: "GET", query: { orgId } });
}

export function invite(email: string, orgId: string) {
  return request<{ id: string; userId: string; orgId: string; role: string }>("/memberships/invite", {
    method: "POST",
    body: { email, orgId },
  });
}

export function acceptInvite(orgId: string) {
  return request<{ message: string }>("/memberships/accept", { method: "POST", body: { orgId } });
}

export function removeMembership(userId: string, orgId: string) {
  return request<{ message: string }>("/memberships", { method: "DELETE", body: { userId, orgId } });
}
