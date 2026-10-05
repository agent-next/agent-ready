# agent-ready — agent guide

Org standard: https://github.com/agent-next/.github/blob/main/AGENT-STANDARD.md

## Purpose

Public npm/TypeScript tool (Node >= 20, Commander CLI) that checks and sets up repo
infrastructure for agent-guided development: `check` scans a repo for 9 readiness areas,
`init` generates the missing files. Scanning is local only — no external API calls.

## Orient

- `src/index.ts` CLI entry; `src/commands/{check,init}.ts`; `src/checker.ts` readiness checker;
  `src/engine/` scan context + project-type detection; `src/templates/` init templates;
  `src/utils/`; `src/types.ts` (export all types from here).
- `packages/mcp/` MCP server (`check_repo_readiness`); `skill/agent-ready/` packaged skill;
  `test/` mirrors `src/` (`test/e2e/`, fixtures in `test/fixtures/`).
- Architecture diagram, conventions, testing and git rules: [docs/agent-reference.md](docs/agent-reference.md).
  Pre-baseline AGENTS.md (stale, kept for history): [docs/archive/AGENTS-legacy.md](docs/archive/AGENTS-legacy.md).
- Run the CLI from source: `npm run dev -- check .`

## Setup

`make setup` (runs `npm ci`; needs Node >= 20 and npm). A `.devcontainer/` is provided.

## Check

`make check` runs `npm run check` (typecheck + lint + prettier check) then `npm test`
(`tsx --test test/*.test.ts`). CI (`.github/workflows/ci.yml`) additionally runs a build job:
`npm run build`. Coverage: `npm run test:coverage`.

## Boundaries

- Keep checks pure and local; TypeScript strict mode, interfaces over types, avoid `any`.
- Public repo: never commit secrets, tokens or `.env` files; no internal plans or private links.
- Do not change CI, dependencies or release/publish workflows without approval.

## Done

- Branch per change (`feat/`, `fix/`, `docs/`, `chore/`) -> PR with a semantic-prefix title; atomic commits.
- Tests updated in the same change; `make check` green locally and CI green before merge.
- Receipts (commands + real output) go in the PR body.
