# Backend — Trello-style Project Management API

A layered Express + Bun + Prisma backend: Users belong to Organisations via
Memberships (ADMIN/MEMBER), Organisations own Boards, Boards contain Sections,
Sections contain Issues, and Issues can be assigned to members via
IssueMapping.

## Architecture

```
src/
  config/env.ts        Zod-validated environment variables (fails fast on boot)
  lib/prisma.ts         Re-exports the PrismaClient from the shared `db` package
  types/express/        Augments req.userId typing
  utils/                AppError, catchAsync, jwt, response helpers
  middleware/            auth, validate (zod), rbac (org member/admin), error, 404
  schemas/               Zod request schemas, one per resource
  services/               All business logic + authorization + Prisma calls
  controllers/            Thin HTTP layer: parse req -> call service -> send response
  routes/                Express routers, one per resource
  app.ts                  Express app wiring (middleware order, mounting)
  server.ts               Boots the HTTP server, graceful shutdown
prisma/schema.prisma      Data model
```

Request flow: `route -> auth/validate/rbac middleware -> controller -> service -> prisma`.
Errors thrown anywhere (`AppError` or Prisma errors) are caught centrally by
`errorMiddleware` — no repeated try/catch or manual status codes in controllers.

## Getting started

```bash
bun install
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
bun run dev
```

The Prisma client itself is generated and migrated from the `db` package
(`packages/db`) — run `bun run db:generate` / `db:migrate` there, not here.
This app just imports the already-generated client via `db/client`.

Server starts on `http://localhost:3000`, all routes mounted under `/api/v1`.

## API overview

All routes except `/auth/*` and `GET /health` require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/signup` | Register a user |
| POST | `/api/v1/auth/signin` | Log in, returns JWT |
| POST | `/api/v1/organisations` | Create an org (creator becomes ADMIN) |
| GET | `/api/v1/organisations` | List orgs the caller belongs to |
| DELETE | `/api/v1/organisations` | Delete an org (admin only) |
| POST | `/api/v1/memberships/invite` | Add a user to an org (admin only) |
| POST | `/api/v1/memberships/accept` | Confirm membership in an org |
| DELETE | `/api/v1/memberships` | Remove a member (admin only) |
| POST | `/api/v1/boards` | Create a board (org member only) |
| GET | `/api/v1/boards?orgId=` | List boards in an org |
| PUT | `/api/v1/boards` | Rename a board |
| DELETE | `/api/v1/boards` | Delete a board |
| POST | `/api/v1/sections` | Create a section |
| GET | `/api/v1/sections?boardId=` | List sections on a board |
| PUT | `/api/v1/sections` | Rename a section |
| DELETE | `/api/v1/sections` | Delete a section |
| POST | `/api/v1/issues` | Create an issue |
| GET | `/api/v1/issues?sectionId=\|boardId=` | List issues |
| GET | `/api/v1/issues/:issueId` | Get one issue |
| PUT | `/api/v1/issues` | Update an issue |
| DELETE | `/api/v1/issues/:issueId` | Delete an issue |
| POST | `/api/v1/issues/assign` | Assign a member to an issue |
| DELETE | `/api/v1/issues/:issueId/assign/:userId` | Unassign a member |

## Response shape

Success: `{ "success": true, "data": ... }`
Error: `{ "success": false, "error": "message" }`

## Notes on production hardening already baked in

- Environment variables are validated with Zod on boot — a missing
  `JWT_SECRET` or `DATABASE_URL` fails immediately with a clear message
  instead of crashing mysteriously on the first request.
- Authorization is resource-based: every write path re-derives the
  organisation from the resource being touched and checks the caller's
  membership, rather than trusting an `orgId` the client could tamper with.
- Cascading deletes are declared in `schema.prisma` (`onDelete: Cascade`),
  so deleting a Board/Section/Organisation no longer requires manual
  loop-and-delete cleanup code — Postgres handles it atomically.
- Prisma's typed unique compound indexes (`userId_orgId`, `userId_issueId`)
  are used instead of `findFirst`, which is both faster and clearer intent.
- Centralized error handling maps Prisma error codes (`P2002` unique
  violation, `P2025` not found) to sensible HTTP statuses automatically.
