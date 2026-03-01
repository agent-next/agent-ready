TypeScript project using Node 20+ with strict mode enabled.

Commands: `npm test` (152 tests), `npm run check` (typecheck + lint + format), `npm run build` (tsc).

Code style: kebab-case files, PascalCase interfaces, camelCase functions. Interfaces over types. Avoid `any`, use `unknown`. Export types from `src/types.ts`.

Testing: Node built-in test runner via `tsx --test`. Fixtures in `test/fixtures/`. Always run tests after changes and update tests in the same pass as code changes.

Git: Atomic commits with semantic prefixes (feat/fix/docs/chore). Run `npm run check` before committing.

Do not add external API calls — all scanning must remain local. Do not modify `src/types.ts` without updating all consumers.
