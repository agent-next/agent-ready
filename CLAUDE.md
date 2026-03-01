# agent-ready

Repo infrastructure setup tool for agent-guided development. TypeScript, Node 20+, Commander CLI.

## Commands

```bash
npm install                    # install dependencies
npm run dev -- scan .          # run CLI in dev mode
npm test                       # 152 tests, node test runner
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
  → src/commands/scan.ts → src/scanner.ts (orchestrator)
  → src/commands/init.ts (file generation)

src/scanner.ts
  → src/profiles/ (load YAML profile)
  → src/engine/context.ts (build scan context, detect project type)
  → src/checks/ (execute checks: file-exists, path-glob, dependency-detect, etc.)
  → src/engine/level-gate.ts (80% rule, level calculation)
  → src/output/ (JSON + markdown formatting)
```

## Conventions

- TypeScript strict mode, interfaces over types, avoid `any`
- Files: `kebab-case.ts`, interfaces: `PascalCase`, functions: `camelCase`
- Check IDs: `pillar.check_name` (e.g., `docs.readme`, `test.framework`)
- Export all types from `src/types.ts`
- Keep checks pure — no external API calls, scanning is local only

## Testing

- Runner: `tsx --test` (Node built-in test runner)
- Test files mirror source: `src/checks/file-exists.ts` → `test/checks.test.ts`
- Fixtures in `test/fixtures/` (minimal-repo, standard-repo, l3-repo, monorepo, python-repo, empty-repo)
- Run tests after every change: `npm test`
- Update tests in the same pass as code changes

## Git

- Atomic commits, one logical change per commit
- Branch naming: `feat/`, `fix/`, `docs/`, `chore/`
- PR titles: semantic prefix (`feat:`, `fix:`, `docs:`, etc.)
- Run `npm run check` before committing

@AGENTS.md
