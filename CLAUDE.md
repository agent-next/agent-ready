# agent-ready

Best practices collection for high-quality GitHub repos + AI coding agent workflows. TypeScript, Node 20+, Commander CLI.

## Commands

```bash
npm install                    # install dependencies
npm run dev -- check .         # run CLI in dev mode
npm test                       # 102 tests, node test runner
npm run test:coverage          # coverage with c8
npm run typecheck              # tsc --noEmit
npm run lint                   # eslint
npm run format                 # prettier
npm run check                  # typecheck + lint + format (all gates)
npm run build                  # tsc → dist/
```

## Architecture

```
src/index.ts (CLI entry, commander)
  → src/commands/check.ts → src/checker.ts (9-area readiness checker)
  → src/commands/init.ts (file generation)

src/checker.ts
  → src/engine/context.ts (build scan context, detect language + project type)
  → src/utils/fs.ts (fileExists, readFile, findFiles)

packages/mcp/ (MCP server, check_repo_readiness tool)

skill/agent-ready/ (SKILL.md + 8 reference docs + BDT testing refs)
```

## Conventions

- TypeScript strict mode, interfaces over types, avoid `any`
- Files: `kebab-case.ts`, interfaces: `PascalCase`, functions: `camelCase`
- Area names: `agent_guidance`, `code_quality`, `testing`, `ci_cd`, `hooks`, `branch_rulesets`, `templates`, `devcontainer`, `security`
- Export all types from `src/types.ts`
- Keep checks pure — no external API calls, scanning is local only

## Testing

- Runner: `tsx --test` (Node built-in test runner)
- Test files mirror source: `src/checker.ts` → `test/checker.test.ts`
- Fixtures in `test/fixtures/` (minimal-repo, standard-repo, l3-repo, monorepo, python-repo, empty-repo)
- Run tests after every change: `npm test`
- Update tests in the same pass as code changes

## Git

- Atomic commits, one logical change per commit
- Branch naming: `feat/`, `fix/`, `docs/`, `chore/`
- PR titles: semantic prefix (`feat:`, `fix:`, `docs:`, etc.)
- Run `npm run check` before committing

@AGENTS.md
