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
- Architecture diagram and full command list: [docs/agent-reference.md](docs/agent-reference.md).
- Run the CLI from source: `npm run dev -- check .`

## Setup

`make setup` (runs `npm ci`; needs Node >= 20 and npm). A `.devcontainer/` is provided.

## Check

`make check` runs `npm run check` (typecheck + lint + prettier check; no tests) then `npm test`
(`tsx --test test/*.test.ts`). `npm run check` alone is not the full gate. CI (`.github/workflows/ci.yml`) additionally runs a build job:
`npm run build`. Coverage: `npm run test:coverage`.

## Conventions

- TypeScript strict mode, interfaces over types, avoid `any`; export all types from `src/types.ts`.
- Files `kebab-case.ts`, interfaces `PascalCase`, functions `camelCase`.
- Area names: `agent_guidance`, `code_quality`, `testing`, `ci_cd`, `hooks`, `branch_rulesets`,
  `templates`, `devcontainer`, `security`.
- Keep checks pure: no external API calls, scanning is local only.
- Tests mirror source (`src/checker.ts` -> `test/checker.test.ts`); fixtures in `test/fixtures/`
  (minimal-repo, standard-repo, l3-repo, monorepo, python-repo, empty-repo). Update tests in the
  same change as code.

## Boundaries

- Hard limits (secrets, default-branch force-push, visibility, releases, publishing) are defined in
  the org standard linked above; follow them.
- Public repo: never commit secrets, tokens or `.env` files; no internal plans or private links.

## Done

- Branch per change (`feat/`, `fix/`, `docs/`, `chore/`) -> PR with a semantic-prefix title (`feat:`, `fix:`, `docs:`); atomic commits, one logical change each.
- Tests updated in the same change; `make check` green locally and CI green before merge.
- Receipts (commands + real output) go in the PR body.
