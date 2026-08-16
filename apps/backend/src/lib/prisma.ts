// Prisma client lives in the shared `db` workspace package (packages/db),
// already generated and configured there. Re-exported here so the rest
// of this app only ever imports from "../lib/prisma.js" — if the shared
// package's export path ever changes, this is the one line to update.
export { prisma } from "db/client";
