export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function buildApiUrl(path: string) {
  const base = API_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api/v1${normalizedPath}`;
}

export class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let token: string | null = localStorage.getItem("flow_token");

export function setToken(next: string | null) {
  token = next;
  if (next) localStorage.setItem("flow_token", next);
  else localStorage.removeItem("flow_token");
}

export function getToken() {
  return token;
}

type Query = Record<string, string | undefined>;

function buildQuery(query?: Query) {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined) params.set(k, v);
  });
  const str = params.toString();
  return str ? `?${str}` : "";
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Query;
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query } = opts;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${buildApiUrl(path)}${buildQuery(query)}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = (data && data.error) || res.statusText || "Request failed";
    throw new ApiRequestError(message, res.status);
  }

  return data?.data !== undefined ? data.data : data;
}
