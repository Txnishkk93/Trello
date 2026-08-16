import { expect, test } from "bun:test";
import { buildApiUrl } from "./client";

test("buildApiUrl includes the v1 API prefix and preserves the requested path", () => {
  expect(buildApiUrl("/auth/signin")).toBe("http://localhost:3000/api/v1/auth/signin");
});
