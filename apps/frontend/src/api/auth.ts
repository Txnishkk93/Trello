import { request } from "./client";
import type { User } from "../types";

export function signup(username: string, email: string, password: string) {
  return request<User>("/auth/signup", { method: "POST", body: { username, email, password } });
}

export function signin(email: string, password: string) {
  return request<{ token: string }>("/auth/signin", { method: "POST", body: { email, password } });
}
