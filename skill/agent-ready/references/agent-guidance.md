# Agent Guidance Files

How to write AGENTS.md, CLAUDE.md, copilot-instructions, and cursor rules so that AI coding agents can work effectively in your repository.

---

## Why This Matters

AI agents start every session with zero institutional knowledge. They do not know your project's architecture, naming conventions, test commands, or deployment rules. Without guidance files, agents guess -- and guesses lead to wrong patterns, broken builds, and wasted review cycles.

Guidance files are the onboarding doc for agents. A human developer gets a walkthrough from a teammate. An agent gets a markdown file. The quality of that file directly determines the quality of the agent's output.

**The cost of skipping this:** agents will generate code that looks plausible but violates your conventions. They will run the wrong test command. They will put files in the wrong directory. They will use patterns you abandoned six months ago. Every review cycle you spend correcting these mistakes is time you could have saved with 50 lines of guidance.

---

## What to Check First

Before writing new guidance files, detect what already exists.

```
Files to look for:
- AGENTS.md                              # Cross-tool standard
- CLAUDE.md                              # Claude Code specific
- .claude/settings.json                  # Claude Code permissions
- .github/copilot-instructions.md        # GitHub Copilot
- .github/instructions/*.instructions.md # Copilot path-scoped
- .cursor/rules/*.mdc                    # Cursor IDE
- .cursorrules                           # Legacy Cursor (deprecated)
- .windsurfrules                         # Windsurf IDE
- .aider.conf.yml                        # Aider
- .github/workflows/copilot-setup-steps.yml  # Copilot coding agent
```

If guidance files exist, read them before generating new ones. Check whether content is duplicated across formats. Identify which files are stale vs actively maintained.

---

## The Formats

### 1. AGENTS.md — Cross-Tool Standard

**What:** A single markdown file at the repo root that any AI coding agent can read. Supported by Claude Code, GitHub Copilot, Cursor, Gemini CLI, Windsurf, and others. Present in 60,000+ public repos.

**Where:** Repository root (`/AGENTS.md`). Can also be placed in subdirectories for scoped instructions -- agents load the nearest ancestor AGENTS.md plus the one in the current directory.

**Structure:** Keep under 150 lines. Six sections cover what agents need:

| Section | Purpose |
|---------|---------|
| Commands | How to build, test, lint, format, deploy |
| Testing | Test runner, how to run one file, coverage command |
| Structure | Where code lives, key directories, file naming |
| Style | Naming conventions, patterns to follow, patterns to avoid |
| Git | Branch naming, commit message format, PR process |
| Boundaries | Files to never edit, areas that need human review |

**Example of a good AGENTS.md (~50 lines):**

```markdown
# AGENTS.md

## Commands
- `npm run build` — compile TypeScript to dist/
- `npm test` — run all tests (vitest)
- `npm run test:unit -- path/to/file` — run one test file
- `npm run lint` — ESLint check
- `npm run lint:fix` — ESLint auto-fix
- `npm run typecheck` — tsc --noEmit

## Testing
- Tests live in `tests/` mirroring `src/` structure
- Test files: `*.test.ts`
- Run single test: `npx vitest run tests/unit/auth.test.ts`
- Coverage: `npm run test:coverage` (threshold: 80%)
- Always run tests before committing

## Structure
- `src/` — application source (TypeScript)
- `src/api/` — REST endpoint handlers
- `src/services/` — business logic
- `src/models/` — database models (Drizzle ORM)
- `src/utils/` — shared utilities
- `tests/unit/` — unit tests
- `tests/integration/` — integration tests (needs DB)
- `migrations/` — SQL migrations (do not edit by hand)

## Style
- TypeScript strict mode, no `any`
- Prefer `async/await` over raw promises
- Use named exports, not default exports
- Error handling: throw typed errors from `src/errors.ts`
- Database: use Drizzle query builder, never raw SQL
- Imports: use `@/` path alias for `src/`

## Git
- Branch: `feat/short-description` or `fix/short-description`
- Commits: conventional commits (`feat:`, `fix:`, `docs:`, `test:`)
- PRs: one concern per PR, update CHANGELOG.md for features

## Boundaries
- `migrations/` — never create or edit migrations, ask human
- `.env` — never commit, see `.env.example` for required vars
- `src/generated/` — auto-generated, do not edit
- `infrastructure/` — Terraform, requires human review
```

### 2. CLAUDE.md — Claude Code Specific

**What:** Instructions loaded specifically by Claude Code. Supports features that AGENTS.md does not: file imports, hierarchical loading, and hooks configuration.

**Where:** Repository root (`/CLAUDE.md`), plus optional subdirectory files.

**Key features:**

- **Import AGENTS.md:** Start with `@AGENTS.md` to pull in cross-tool instructions, then add Claude-specific content below.
- **Hierarchical loading:** Claude Code loads CLAUDE.md from parent directories at launch. Subdirectory CLAUDE.md files load on demand when Claude reads files in that directory.
- **Project vs subdirectory:** Root CLAUDE.md has project-wide rules. A `tests/CLAUDE.md` can have test-specific rules. A `packages/api/CLAUDE.md` can have API-specific rules.

**What to add beyond AGENTS.md:**

- Hooks configuration references (point to `.claude/settings.json`)
- MCP server usage instructions
- Permission notes (what Claude is allowed to do autonomously)
- Subdirectory-specific context that would clutter the root AGENTS.md

**Example:**

```markdown
@AGENTS.md

# Claude-Specific

## Permissions
- Allowed: read/write src/ and tests/
- Denied: write to .env, infrastructure/, migrations/
- See `.claude/settings.json` for full permission config

## Hooks
- PostToolUse (Write/Edit): auto-runs `npm run lint:fix` on changed files
- See `.claude/settings.json` for hook config

## MCP Servers
- `project-db`: query dev database (read-only)
- `project-docs`: search internal documentation

## Subdirectory Notes
- packages/api/ has its own CLAUDE.md with API-specific patterns
- packages/web/ has its own CLAUDE.md with React component patterns
```

### 3. `.github/copilot-instructions.md` — GitHub Copilot

**What:** Instructions automatically loaded by GitHub Copilot (Chat, PR reviews, Copilot coding agent). Max 2 pages -- Copilot truncates beyond that.

**Where:** `.github/copilot-instructions.md`

**Scope:** Coding conventions only. Do not duplicate project structure or build commands that belong in AGENTS.md. Copilot also reads AGENTS.md, so this file should add Copilot-specific guidance or emphasize key conventions.

**Best practice:** Reference AGENTS.md for full context, keep this file focused on the conventions Copilot needs for code completion and review.

**Example:**

```markdown
# Copilot Instructions

Follow the conventions in AGENTS.md at the repo root.

## Key Conventions
- TypeScript strict mode, never use `any`
- Named exports only, no default exports
- Use Drizzle ORM query builder, never raw SQL
- Error types from `src/errors.ts`, never throw plain strings
- React components: functional with hooks, no class components
- Test files: colocate with source as `*.test.ts`
```

### 4. `.github/instructions/*.instructions.md` — Copilot Path-Scoped

**What:** File-type-specific instructions for GitHub Copilot. Each file has YAML frontmatter with `applyTo` globs that scope when the instructions activate.

**Where:** `.github/instructions/` directory.

**Example — React components:**

```markdown
---
applyTo: "src/components/**/*.tsx"
---

# React Component Instructions

- Use functional components with hooks
- Props interface named `{ComponentName}Props`
- Export component as named export
- Colocate styles in `*.module.css`
- Include unit test in same directory as `*.test.tsx`
- Use `useTranslation()` for all user-visible strings
```

**Example — Database migrations:**

```markdown
---
applyTo: "migrations/**/*.sql"
---

# Migration Instructions

- Never modify existing migrations
- Always add a new migration file
- Use sequential numbering: `NNNN_description.sql`
- Include both up and down in the same file
- Test with `npm run migrate:dry`
```

### 5. `.cursor/rules/*.mdc` — Cursor IDE

**What:** Rule files for Cursor IDE with glob scoping and activation modes.

**Where:** `.cursor/rules/` directory. Each file is an `.mdc` file.

**Modes:**

| Mode | When it activates |
|------|------------------|
| Always | Loaded for every interaction |
| Auto | Loaded when matching files are referenced |
| Agent Requested | Agent decides whether to load based on description |
| Manual | Only loaded when explicitly invoked |

**Example — `general.mdc` (Always mode):**

```
---
description: General project conventions
globs:
alwaysApply: true
---

- TypeScript strict, no `any`
- Named exports only
- Conventional commits
- See AGENTS.md for full project context
```

**Example — `react.mdc` (Auto mode):**

```
---
description: React component conventions
globs: src/components/**/*.tsx
alwaysApply: false
---

- Functional components with hooks
- Props interface: {ComponentName}Props
- Named export, no default export
- Colocate tests as *.test.tsx
```

### 6. `.github/workflows/copilot-setup-steps.yml` — Copilot Coding Agent

**What:** Environment setup for GitHub's Copilot coding agent. This workflow runs before Copilot starts working on an issue or PR. It installs dependencies, sets up tools, and prepares the environment.

**Where:** `.github/workflows/copilot-setup-steps.yml`

**Requirements:**
- Trigger must be `workflow_dispatch` only
- Job must be named `copilot-setup-steps` (exact name required)
- Must install all dependencies the agent needs to build, test, and lint

**Example:**

```yaml
name: Copilot Setup Steps
on: workflow_dispatch

jobs:
  copilot-setup-steps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

For projects with system dependencies:

```yaml
name: Copilot Setup Steps
on: workflow_dispatch

jobs:
  copilot-setup-steps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -e '.[dev]'
      - run: playwright install --with-deps chromium
```

---

## Best Practice: Single Source of Truth

**AGENTS.md is the canonical source.** All other formats should reference or subset it.

```
AGENTS.md                          # Full project context (all tools read this)
  |
  +-- CLAUDE.md                    # Imports @AGENTS.md, adds Claude-specific
  +-- .github/copilot-instructions.md  # Key conventions subset
  +-- .cursor/rules/general.mdc        # Key conventions subset
```

This pattern means you update one file when conventions change. The tool-specific files stay thin and reference the source.

**When content must differ:** Some tools need format-specific features (Cursor's glob scoping, Copilot's path-scoped instructions, Claude's hooks). Put tool-specific features in the tool-specific file. Put shared knowledge in AGENTS.md.

---

## What Good Looks Like

A well-written guidance file:

1. **Is project-specific.** It describes THIS project's actual commands, directories, and conventions -- not generic advice.
2. **Is actionable.** Every line tells the agent something it can act on: a command to run, a pattern to follow, a file to avoid.
3. **Is concise.** Under 150 lines for AGENTS.md. Under 2 pages for copilot-instructions. Agents have context limits; every wasted line pushes out useful content.
4. **Matches reality.** The commands listed actually work. The directory structure matches the repo. The conventions match the code.
5. **Specifies boundaries.** It says what NOT to do, not just what to do. Auto-generated files, infrastructure directories, and sensitive files get explicit "do not edit" markers.

---

## Common Mistakes

### Duplicating content across formats
Writing the same conventions in AGENTS.md, CLAUDE.md, copilot-instructions, and cursor rules. When conventions change, some files get updated and others do not. Use AGENTS.md as the source and reference it from other files.

### Putting style rules in guidance instead of a linter
Writing "use 2-space indentation" or "always add trailing commas" in AGENTS.md. These rules belong in ESLint/Prettier/Ruff/Biome config where they are enforced automatically. Guidance files should document conventions that linters cannot check: architectural patterns, naming schemes, when to use which abstraction.

### Making it too long
Guidance files over 300 lines bury signal in noise. Agents read the whole file into context; long files waste tokens and dilute important rules. If you need more than 150 lines in AGENTS.md, split subdirectory-specific content into subdirectory AGENTS.md or CLAUDE.md files.

### Generic boilerplate that does not describe the actual project
Content like "write clean code" or "follow best practices" or "use meaningful variable names" provides zero information. Every line should be specific to your project. If you could paste the same content into any repo, it does not belong in guidance.

### Not updating when the project changes
Guidance files that reference deleted directories, old test commands, or deprecated patterns actively mislead agents. Treat guidance files as code: update them when you refactor.

### Forgetting boundaries
Listing what agents should do but not what they should avoid. Agents need explicit "do not touch" markers for auto-generated files, infrastructure configs, and sensitive areas.

### Wrong file for wrong tool
Putting Claude hooks config in AGENTS.md (other tools ignore it). Putting build commands in copilot-instructions.md (it should focus on conventions). Each format has a purpose; respect it.

---

## Verification

After creating or updating guidance files, verify they work:

### Check file existence and placement
```
Glob: AGENTS.md
Glob: CLAUDE.md
Glob: .github/copilot-instructions.md
Glob: .github/instructions/*.instructions.md
Glob: .cursor/rules/*.mdc
Glob: .github/workflows/copilot-setup-steps.yml
```

### Check AGENTS.md quality
- Does it list actual commands that work in this repo?
- Does the directory structure match the real repo layout?
- Are conventions consistent with existing code patterns?
- Is it under 150 lines?
- Does it include boundaries (files/areas to avoid)?

### Check CLAUDE.md integration
- Does it start with `@AGENTS.md`?
- Does it add Claude-specific content (hooks, permissions, MCP)?
- Are subdirectory CLAUDE.md files present where needed?

### Check copilot-instructions.md
- Is it under 2 pages?
- Does it focus on coding conventions (not project structure)?
- Does it reference AGENTS.md for full context?

### Check cursor rules
- Do `.mdc` files have correct frontmatter (description, globs, alwaysApply)?
- Is the general rule set to `alwaysApply: true`?
- Do path-scoped rules have correct glob patterns?

### Check copilot-setup-steps.yml
- Is trigger `workflow_dispatch` only?
- Is job named exactly `copilot-setup-steps`?
- Does it install all dependencies needed to build and test?

### Cross-file consistency
- Is AGENTS.md the single source of truth?
- Do other files reference or subset it (not duplicate it)?
- Are there contradictions between files?

### Test with an agent
The ultimate verification: start a new agent session and ask it to make a small change. Does it find the right files? Run the right commands? Follow the right patterns? If not, the guidance is missing something.
