# Flow — Frontend (Bun)

React + TypeScript + Tailwind frontend for the organizations/boards/sections/issues API, using **Bun** as the package manager and script runner instead of npm.

## Setup

```bash
bun install
cp .env.example .env   # set VITE_API_URL if your backend isn't on localhost:3000
bun run dev
```

This starts the Vite dev server (Bun runs Vite's Node-compatible CLI directly — Vite itself is unchanged, only the package manager/runner is Bun).

## Scripts

```bash
bun run dev       # start dev server
bun run build     # type-check (tsc) + production build
bun run preview   # preview the production build locally
```

## If your backend also runs on Bun

If you're running the Express backend from the API reference doc with `bun run index.ts` instead of `node`, no changes are needed on the frontend side — it just talks to whatever `VITE_API_URL` points to over HTTP.

## Notes

- Auth token is stored in localStorage and attached as `Authorization: Bearer <token>` to every request (`src/api/client.ts`).
- Only endpoints that exist in the backend are wired up — there's no issue-move or comment UI since those routes aren't implemented server-side yet.
- Design tokens (colors, radius, type scale) live in `tailwind.config.js` under a monochrome palette.
- `bun.lockb` will be generated on first `bun install` — commit it to your repo for reproducible installs.
