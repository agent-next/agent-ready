# AGENTS.md

## Purpose

`agent-ready` is a TypeScript CLI + library (Node >= 20) that scans a repository
and reports how well it is set up for AI coding agents across 9 readiness areas.
It ships as a GitHub Action (`action.yml`), an MCP server (`packages/mcp`), a
plugin (`packages/plugin`), a skill (`skill/agent-ready/`), and demo apps under
`apps/`.

Org standard (binding): https://github.com/agent-next/.github/blob/main/AGENT-STANDARD.md

## Orient

- `src/` — CLI entry `index.ts`, library entry `lib.ts`, `checker.ts` (9-area
  readiness check), `commands/` (`check`, `init`), `engine/`, `utils/`, `types.ts`
- `packages/mcp` — `agent-ready-mcp` MCP server (`check_repo_readiness` tool)
- `packages/plugin` — packaged agent plugin; `packages/*` are npm workspaces of the root
- `apps/website` — React 19 + Vite + Tailwind frontend (separate package, own AGENTS.md)
- `apps/backend` — Fastify API + multi-agent scan orchestration (separate package, own AGENTS.md)
- `test/` — `*.test.ts` plus `e2e/`; repo fixtures in `test/fixtures/`
- `profiles/`, `templates/` — check profile and `init` file templates

## Setup

```bash
make setup          # npm ci (root + packages/* workspaces)
```

`apps/*` are standalone packages outside the root workspaces:
`cd apps/<app> && npm install` when working there.

## Check

```bash
make check          # npm run check (typecheck + eslint + prettier) then npm test
npm run dev -- check .   # run the CLI against the current repo
npm run build       # tsc -> dist/
```

`npm test` runs `tsx --test test/*.test.ts`. CI (`.github/workflows/ci.yml`)
runs lint, typecheck, tests on Node 20/22, and a build on every PR.

## Boundaries

- Keep checks local: no external API calls from `src/` scan paths
- Strict TypeScript: interfaces over types, avoid `any`, export types from `src/types.ts`
- Naming: `kebab-case.ts` files, `PascalCase` interfaces, `camelCase` functions
- Tests live in `test/` mirroring source names; update them in the same change
- `apps/*` have their own deps, checks, and deploys — do not wire them into root scripts

## Done

- `make check` is green and `npm run build` succeeds
- Branch names use `feat|fix|docs|chore|.../name`; PR titles use a semantic prefix
- No secrets, tokens, or `.env` files committed
