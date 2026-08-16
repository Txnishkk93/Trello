import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(` Backend running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
});

/**
 * Close the HTTP server and the Prisma connection pool cleanly on
 * termination signals, so container/platform restarts (Render, Docker,
 * etc.) don't leave dangling DB connections.
 */
async function shutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
