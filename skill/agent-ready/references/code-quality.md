# Code Quality

Deterministic, fast feedback that agents can act on immediately. A formatter is cheaper and more reliable than burning tokens on style instructions in CLAUDE.md or AGENTS.md. If a tool can catch it, don't write a rule for it -- configure the tool.

---

## Table of Contents

1. [Why This Matters for Agents](#why-this-matters-for-agents)
2. [Detection: Check Before You Install](#detection-check-before-you-install)
3. [JavaScript / TypeScript](#javascript--typescript)
4. [Python](#python)
5. [EditorConfig](#editorconfig)
6. [What to Generate](#what-to-generate)
7. [Common Mistakes](#common-mistakes)
8. [Verification](#verification)

---

## Why This Matters for Agents

Agents generate code. Without automated quality checks, every token spent on "please use single quotes" or "sort imports alphabetically" is wasted -- and unreliable. Deterministic tooling solves this:

| Problem | Bad (token-based) | Good (tool-based) |
|---------|-------------------|-------------------|
| Formatting | "Use 2-space indent" in AGENTS.md | `biome format --write` or `ruff format` |
| Import order | "Sort imports alphabetically" | Formatter handles it automatically |
| Unused variables | Agent reviews own code | `biome check` or `ruff check` catches it |
| Type errors | Hope for the best | `tsc --noEmit` or `mypy` catches it |

**Key insight**: A 50ms linter run replaces thousands of tokens of style instructions and catches errors the agent will never notice through self-review.

---

## Detection: Check Before You Install

Before adding any tool, check what already exists. Never replace a working setup.

### What to look for

```
# JS/TS linters and formatters
.eslintrc.* / eslint.config.js / eslint.config.mjs    # ESLint (flat or legacy config)
.prettierrc* / prettier.config.*                        # Prettier
biome.json / biome.jsonc                                # Biome
deno.json                                               # Deno has built-in formatter/linter

# Python linters and formatters
pyproject.toml  [tool.ruff]                             # Ruff
pyproject.toml  [tool.black]                            # Black
setup.cfg / .flake8                                     # Flake8
.isort.cfg / pyproject.toml [tool.isort]                # isort
mypy.ini / pyproject.toml [tool.mypy]                   # mypy
pyrightconfig.json / pyproject.toml [tool.pyright]      # Pyright

# Editor config
.editorconfig                                           # EditorConfig

# Pre-commit hooks
.pre-commit-config.yaml                                 # pre-commit framework
.husky/                                                 # Husky (JS)
lefthook.yml                                            # Lefthook
```

### Decision tree

```
Is there an existing linter/formatter?
  YES --> Keep it. Ensure it runs in CI. Done.
  NO  --> Is this JS/TS?
            YES --> Install Biome (single tool, fastest)
          Is this Python?
            YES --> Install Ruff (single tool, fastest)
```

**Do not** add Biome to a project that already has ESLint configured and working. Do not add Ruff to a project that already has Black configured and working. Respect existing choices -- the goal is enforced quality, not tool churn.

---

## JavaScript / TypeScript

### Recommended: Biome

Biome replaces ESLint + Prettier in a single binary. Written in Rust, 10-20x faster, zero config needed to start.

**Install:**
```bash
npm install --save-dev --exact @biomejs/biome
npx biome init
```

**biome.json:**
```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.x/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error",
        "useExhaustiveDependencies": "warn"
      },
      "suspicious": {
        "noExplicitAny": "warn"
      },
      "style": {
        "useConst": "error",
        "noNonNullAssertion": "warn"
      }
    }
  },
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  }
}
```

**package.json scripts:**
```json
{
  "scripts": {
    "check": "biome check .",
    "check:fix": "biome check --write .",
    "format": "biome format --write ."
  }
}
```

### If ESLint already exists

Keep ESLint. Make sure it has:
- `eslint.config.js` (flat config, modern) or `.eslintrc.*` (legacy, still works)
- A CI step that runs `eslint --max-warnings 0` (fail on warnings)
- Prettier or Biome as the formatter (ESLint should not handle formatting)

### TypeScript strict mode

Every TypeScript project should aim for strict mode. This is the single highest-impact type safety setting.

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**What `strict: true` enables** (you get all of these with one flag):
- `strictNullChecks` -- catches null/undefined bugs
- `noImplicitAny` -- requires explicit types where inference fails
- `strictBindCallApply` -- type-safe bind/call/apply
- `strictFunctionTypes` -- correct function type variance
- `strictPropertyInitialization` -- class properties must be initialized
- `noImplicitThis` -- catches unbound `this`
- `alwaysStrict` -- emits `"use strict"` in every file
- `useUnknownInCatchVariables` -- catch variables typed as `unknown`

---

## Python

### Recommended: Ruff

Ruff replaces Black + isort + Flake8 + pyflakes + pycodestyle + dozens of other tools. Written in Rust, 10-100x faster than the tools it replaces.

**Install:**
```bash
# With uv (recommended)
uv add --dev ruff

# With pip
pip install ruff
```

**pyproject.toml:**
```toml
[tool.ruff]
target-version = "py312"
line-length = 100

[tool.ruff.lint]
select = [
    "E",      # pycodestyle errors
    "W",      # pycodestyle warnings
    "F",      # pyflakes
    "I",      # isort
    "N",      # pep8-naming
    "UP",     # pyupgrade
    "B",      # flake8-bugbear
    "SIM",    # flake8-simplify
    "TCH",    # flake8-type-checking (move imports behind TYPE_CHECKING)
    "RUF",    # Ruff-specific rules
]
ignore = [
    "E501",   # line too long (formatter handles this)
]

[tool.ruff.lint.isort]
known-first-party = ["my_package"]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
```

**Usage:**
```bash
ruff check .              # Lint
ruff check --fix .        # Lint + auto-fix
ruff format .             # Format
```

### Type checking: mypy

mypy catches type errors that Ruff does not. They complement each other: Ruff handles style/correctness, mypy handles types.

**pyproject.toml:**
```toml
[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true

# Per-module overrides for gradual adoption
[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false

[[tool.mypy.overrides]]
module = "legacy_module.*"
ignore_errors = true
```

### Package management: uv

uv is the modern Python package manager (written in Rust, 10-100x faster than pip). Use it for dependency management and virtual environments.

```bash
uv init                   # Initialize a new project
uv add fastapi            # Add a dependency
uv add --dev ruff mypy    # Add dev dependencies
uv sync                   # Install all dependencies
uv run pytest             # Run a command in the venv
```

uv uses `pyproject.toml` for everything and generates `uv.lock` for reproducible builds.

---

## EditorConfig

`.editorconfig` provides editor-agnostic formatting basics. Every editor and IDE supports it (VS Code, JetBrains, Vim, Emacs, etc.). It prevents the most basic formatting inconsistencies before any linter even runs.

**.editorconfig:**
```ini
# https://editorconfig.org
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.py]
indent_size = 4

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

**What each setting does:**

| Setting | Value | Why |
|---------|-------|-----|
| `indent_style` | `space` | Consistent rendering everywhere |
| `indent_size` | `2` (JS/TS), `4` (Python) | Language convention |
| `end_of_line` | `lf` | Prevents CRLF/LF mix (git diff noise) |
| `charset` | `utf-8` | Universal standard |
| `trim_trailing_whitespace` | `true` | Eliminates whitespace-only diffs |
| `insert_final_newline` | `true` | POSIX standard, cleaner git diffs |

---

## What to Generate

After analyzing the project, generate these files as needed:

| File | When to Generate |
|------|-----------------|
| `biome.json` | JS/TS project without an existing linter/formatter |
| `pyproject.toml` [tool.ruff] | Python project without an existing linter/formatter |
| `tsconfig.json` | TypeScript project without one, or needs `strict: true` |
| `pyproject.toml` [tool.mypy] | Python project that uses type hints |
| `.editorconfig` | Any project that lacks one |
| package.json scripts | JS/TS project missing `check`/`format`/`lint` scripts |

**Always customize configs to the project.** Read the existing code first:
- What indent size is actually used? Match it.
- What Python version? Set `target-version` accordingly.
- What quote style? Match existing convention.
- What line length? Match what the codebase already uses (80, 100, 120).

**Do not** generate a config that immediately produces 500 lint errors on existing code. The config should pass on the current codebase or require only minor auto-fixable changes.

---

## Common Mistakes

### 1. Putting style rules in CLAUDE.md / AGENTS.md

**Wrong:**
```markdown
# CLAUDE.md
- Use single quotes for strings
- Use 2-space indentation
- Sort imports alphabetically
- No trailing whitespace
```

**Right:**
Configure your formatter. Remove style rules from agent instructions. The formatter enforces them deterministically.

Agents should read CLAUDE.md for architecture decisions, not formatting preferences. Every style rule in CLAUDE.md is a rule that will be inconsistently followed and wastes context tokens on every invocation.

### 2. Enabling strict type checking on a legacy codebase all at once

**Wrong:**
```json
// Adding to a 50k-line JS project with zero types
{ "compilerOptions": { "strict": true } }
// Result: 2,000 type errors, agent gives up
```

**Right -- gradual migration:**
```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false,
    "strictNullChecks": true
  }
}
```

Enable one flag at a time. Fix the errors. Commit. Enable the next flag. `strictNullChecks` alone catches the most bugs and is the best starting point.

For mypy, use per-module overrides:
```toml
[tool.mypy]
strict = false

[[tool.mypy.overrides]]
module = "new_module.*"
strict = true
```

### 3. No format-on-save / no CI enforcement

A formatter that only runs when someone remembers to run it is useless. Enforce it:

- **Pre-commit hook**: Format + lint before every commit (see `references/hooks.md`)
- **CI check**: `biome check .` or `ruff check . && ruff format --check .` in CI (see `references/ci-cd.md`)
- **Editor**: Configure format-on-save in VS Code settings or equivalent

### 4. Running both a linter and a formatter that conflict

**Wrong:**
- ESLint with formatting rules + Prettier (they fight over semicolons, quotes, etc.)
- Black + a flake8 config that disagrees on line length

**Right:**
- Biome (handles both) OR ESLint (no formatting rules) + Prettier
- Ruff (handles both lint + format in one tool)

### 5. Adding a new tool when one already exists

**Wrong:**
```bash
# Project already has ESLint + Prettier configured and working
npm install @biomejs/biome
# Now two tools disagree, CI breaks, team is confused
```

**Right:**
Check for existing tools first (see [Detection](#detection-check-before-you-install)). If ESLint is working, keep it. Only suggest Biome for new projects or when explicitly migrating.

---

## Verification

After setting up code quality tooling, verify everything works:

### Quick checks

```bash
# JS/TS with Biome
npx biome check .                  # Should exit 0 (no errors)
npx biome check --write . && \
  git diff --exit-code             # Format should be a no-op

# Python with Ruff
ruff check .                       # Should exit 0
ruff format --check .              # Should exit 0 (already formatted)

# TypeScript
npx tsc --noEmit                   # Should exit 0 (no type errors)

# Python type checking
mypy src/                          # Should exit 0 or show only known issues
```

### Confirm CI integration

- [ ] Linter runs on every PR
- [ ] Linter fails the build on errors (not just warnings)
- [ ] Formatter check runs on every PR (catches unformatted code)
- [ ] Type checker runs on every PR

### Confirm local developer experience

- [ ] `npm run check` or `ruff check .` works from repo root
- [ ] Pre-commit hook runs formatter + linter (if hooks are set up)
- [ ] New files get auto-formatted when committed
- [ ] No lint errors on current codebase (clean baseline)

### What "done" looks like

```
$ npx biome check .
Checked 142 files in 38ms. No issues found.

$ ruff check . && ruff format --check .
All checks passed!
47 files already formatted.

$ npx tsc --noEmit
# (no output = success)
```

Zero errors on the current codebase. Any new code that violates rules gets caught automatically before it reaches the main branch.
