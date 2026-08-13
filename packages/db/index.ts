import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

function loadEnvFile() {
  const candidates = [
    fileURLToPath(new URL("./.env", import.meta.url)),
    resolve(process.cwd(), "packages/db/.env"),
    resolve(process.cwd(), "../../packages/db/.env"),
    resolve(process.cwd(), "../packages/db/.env"),
  ];

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;

    const contents = readFileSync(candidate, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) continue;

      const key = match[1];
      const rawValue = match[2];

      if (!key || rawValue === undefined) continue;

      let value = rawValue.trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }

    return;
  }

  config();
}

loadEnvFile();

const databaseUrl = process.env.DATABASE_URL;

if (typeof databaseUrl !== "string" || databaseUrl.length === 0) {
  throw new Error("DATABASE_URL is missing. Set it in packages/db/.env or in the runtime environment.");
}

export { PrismaClient };

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});
