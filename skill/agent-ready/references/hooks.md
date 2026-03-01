# Hooks Reference

Two layers of automated quality gates that catch issues before they reach version control or accumulate during editing.

---

## Why Hooks Matter

Hooks are the **last local gate** before code enters version control. They provide faster feedback than CI — a failed pre-commit hook takes seconds, a failed CI pipeline takes minutes. For AI agents, hooks are even more critical: Claude Code hooks catch issues on every single file edit, preventing error accumulation across a session.

**Two layers, both needed:**

| Layer | Trigger | Purpose | Feedback Time |
|-------|---------|---------|---------------|
| Git pre-commit hooks | `git commit` | Gate commits — lint, format, type-check staged files | 2-10 seconds |
| Claude Code hooks | Every `Edit`/`Write` tool call | Gate every edit — run related tests immediately | 1-5 seconds |

Git hooks catch problems at commit time. Claude Code hooks catch problems at edit time. Together they create a tight feedback loop where issues never accumulate.

---

## What to Check (Detection)

Look for existing hook setups before generating new ones.

### Git Hooks

| Tool | Config File | Ecosystem |
|------|-------------|-----------|
| Lefthook | `lefthook.yml` | Any (Go binary, no runtime dependency) |
| Husky | `.husky/pre-commit` | Node.js / npm |
| pre-commit | `.pre-commit-config.yaml` | Python |
| lint-staged | `package.json` → `lint-staged` key | Node.js (pairs with Husky or Lefthook) |

```bash
# Detection commands
ls lefthook.yml .husky/pre-commit .pre-commit-config.yaml 2>/dev/null
grep -l "lint-staged\|husky\|lefthook" package.json 2>/dev/null
cat .git/hooks/pre-commit 2>/dev/null | head -5
```

### Claude Code Hooks

```bash
# Check for Claude Code hooks configuration
cat .claude/settings.json 2>/dev/null | grep -A 20 '"hooks"'
```

Look for `hooks` key in `.claude/settings.json` with `PostToolUse` event matchers.

---

## What Good Looks Like

### Layer 1: Git Pre-Commit Hooks

#### Option A: Lefthook (Recommended for Most Projects)

Parallel execution, 2x faster than Husky, works without Node. Ideal for Python projects or polyglot repos.

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{ts,tsx,js,jsx}"
      run: npx eslint --max-warnings 0 {staged_files}
    format-check:
      glob: "*.{ts,tsx,js,jsx,json,md}"
      run: npx prettier --check {staged_files}
    typecheck:
      glob: "*.{ts,tsx}"
      run: npx tsc --noEmit --pretty
```

Python variant:

```yaml
# lefthook.yml (Python project)
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.py"
      run: ruff check {staged_files}
    format-check:
      glob: "*.py"
      run: ruff format --check {staged_files}
    typecheck:
      glob: "*.py"
      run: mypy {staged_files} --ignore-missing-imports
```

Install: `lefthook install` (add to `postinstall` or `Makefile` init target).

#### Option B: Husky + lint-staged (Node.js Ecosystem Standard)

Largest community, most tutorials available. Requires Node.js.

```bash
# .husky/pre-commit
npx lint-staged
```

```jsonc
// package.json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --max-warnings 0",
      "prettier --check"
    ],
    "*.{json,md,yml}": [
      "prettier --check"
    ]
  },
  "scripts": {
    "prepare": "husky"
  }
}
```

The `prepare` script ensures hooks are installed on `npm install`.

#### Option C: pre-commit Framework (Python Ecosystem)

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.9.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.14.0
    hooks:
      - id: mypy
        additional_dependencies: []
```

Install: `pre-commit install` (add to `Makefile` init target or CI setup step).

### Layer 2: Claude Code Hooks

Configure in `.claude/settings.json` under the `hooks` key. These run automatically during Claude Code sessions.

```jsonc
// .claude/settings.json
{
  "permissions": {
    "allow": [
      "Bash(npm:*)",
      "Bash(npx:*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "bash -c 'FILE=\"$CLAUDE_FILE\"; if [[ \"$FILE\" == *.ts || \"$FILE\" == *.tsx ]]; then npx jest --findRelatedTests \"$FILE\" --passWithNoTests 2>&1 | tail -5; fi'",
        "description": "Run related tests after editing TypeScript files"
      },
      {
        "matcher": "Write",
        "command": "bash -c 'FILE=\"$CLAUDE_FILE\"; if [[ \"$FILE\" == *.ts || \"$FILE\" == *.tsx ]]; then npx eslint --max-warnings 0 \"$FILE\" 2>&1 | tail -10; fi'",
        "description": "Lint newly created files"
      }
    ]
  }
}
```

Python project variant:

```jsonc
// .claude/settings.json (Python project)
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "bash -c 'FILE=\"$CLAUDE_FILE\"; if [[ \"$FILE\" == *.py ]]; then python -m pytest --tb=short -q $(python -c \"import os; f=os.path.basename(\\\"$FILE\\\"); print(\\\"tests/test_\\\" + f if not f.startswith(\\\"test_\\\") else \\\"$FILE\\\")\") 2>&1 | tail -10; fi'",
        "description": "Run corresponding test file after editing Python files"
      },
      {
        "matcher": "Write",
        "command": "bash -c 'FILE=\"$CLAUDE_FILE\"; if [[ \"$FILE\" == *.py ]]; then ruff check \"$FILE\" 2>&1 | tail -10; fi'",
        "description": "Lint newly created Python files"
      }
    ]
  }
}
```

**Why this matters for agents:** Claude gets immediate feedback after every file change. If a test breaks or a lint rule is violated, the agent sees it right away and can fix it in the same edit cycle. Without these hooks, errors accumulate silently until the next manual test run.

---

## What to Generate

When setting up hooks for a project, generate configs based on what the project actually uses:

| Project Signal | Git Hook Tool | Claude Hook Action |
|----------------|---------------|--------------------|
| `package.json` exists | Husky + lint-staged or Lefthook | `npx jest --findRelatedTests` |
| `pyproject.toml` exists | Lefthook or pre-commit | `pytest` related test |
| `Cargo.toml` exists | Lefthook | `cargo test` related |
| `go.mod` exists | Lefthook | `go test ./...` for package |
| Has `tsconfig.json` | Add `tsc --noEmit` check | Type-check on edit |
| Has `biome.json` | Use `biome check` instead of eslint+prettier | `biome check` on write |
| Has `ruff` in pyproject.toml | Use `ruff check` + `ruff format` | `ruff check` on write |

### What to Run in Pre-Commit

**Do run (fast, scoped to changed files):**
- Lint staged files only
- Format check staged files only
- Type-check (if fast enough on incremental)

**Do NOT run (too slow for pre-commit):**
- Full test suite
- Full type-check on entire codebase (for large projects)
- Docker builds
- E2E tests

---

## Best Practices

### File Filtering: Only Check Changed Files

The key to fast pre-commit hooks is running tools only on staged/changed files.

**Lefthook** — built-in `{staged_files}` interpolation:
```yaml
commands:
  lint:
    glob: "*.py"
    run: ruff check {staged_files}
```

**lint-staged** — runs commands only on staged files matching the glob:
```jsonc
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --max-warnings 0"]
  }
}
```

**pre-commit** — automatically passes only staged files to each hook.

### Hook Installation Must Be Automatic

If developers have to remember to install hooks, they won't. Make it automatic:

```jsonc
// package.json (Node.js)
{
  "scripts": {
    "prepare": "husky"
  }
}
```

```makefile
# Makefile (Python / polyglot)
.PHONY: init
init:
	pip install pre-commit
	pre-commit install
	# or: lefthook install
```

```yaml
# CI: verify hooks are installed
- name: Verify hooks
  run: |
    lefthook install
    lefthook run pre-commit
```

### Keep Pre-Commit Under 10 Seconds

If hooks take longer than 10 seconds, developers (and agents) will skip them with `--no-verify`. Measure your hook time:

```bash
time git commit --allow-empty -m "test hook speed"
```

If too slow, move heavy checks to CI and keep only fast checks in pre-commit.

---

## Common Mistakes

### 1. Running the Full Test Suite in Pre-Commit

```yaml
# BAD — takes 30+ seconds, people will use --no-verify
pre-commit:
  commands:
    test:
      run: npm test
```

```yaml
# GOOD — only lint and format, tests run in CI
pre-commit:
  commands:
    lint:
      glob: "*.ts"
      run: npx eslint --max-warnings 0 {staged_files}
```

Tests belong in CI or in Claude Code hooks (which run per-file, not the full suite).

### 2. Not Installing Hooks Automatically

```jsonc
// BAD — requires manual step that everyone forgets
{
  "scripts": {
    "setup-hooks": "husky install"
  }
}
```

```jsonc
// GOOD — runs automatically on npm install
{
  "scripts": {
    "prepare": "husky"
  }
}
```

### 3. Running Checks on All Files Instead of Staged Files

```yaml
# BAD — checks entire codebase on every commit
pre-commit:
  commands:
    lint:
      run: npx eslint . --max-warnings 0
```

```yaml
# GOOD — checks only staged files
pre-commit:
  commands:
    lint:
      glob: "*.{ts,tsx}"
      run: npx eslint --max-warnings 0 {staged_files}
```

### 4. Only Having One Layer

Having git hooks but no Claude Code hooks means the agent doesn't get feedback until commit time — errors accumulate across many edits. Having Claude Code hooks but no git hooks means human developers bypass quality checks.

**Both layers are needed.**

### 5. Full Type-Check on Entire Codebase in Pre-Commit

```yaml
# BAD for large projects — tsc on full codebase can take 20+ seconds
pre-commit:
  commands:
    typecheck:
      run: npx tsc --noEmit
```

For large TypeScript projects, move full `tsc --noEmit` to CI. In pre-commit, use a scoped check or skip type-checking entirely.

### 6. Forgetting CI Verification

Hooks only run locally. A developer can always `git commit --no-verify`. CI must duplicate the critical checks:

```yaml
# .github/workflows/ci.yml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx eslint . --max-warnings 0
      - run: npx prettier --check .
```

---

## Verification

After setting up hooks, verify they actually work.

### Git Hooks

```bash
# 1. Verify hooks are installed
ls -la .git/hooks/pre-commit

# 2. Make a deliberate lint error and try to commit
echo "const x = 1;;" > /tmp/test-lint.ts
cp /tmp/test-lint.ts src/test-lint.ts
git add src/test-lint.ts
git commit -m "test hooks"  # Should fail
git checkout -- src/test-lint.ts

# 3. Verify hook runs fast enough (under 10 seconds)
time git commit --allow-empty -m "timing test"
git reset HEAD~1
```

### Claude Code Hooks

```bash
# 1. Verify hooks are configured
cat .claude/settings.json | python3 -c "
import json, sys
cfg = json.load(sys.stdin)
hooks = cfg.get('hooks', {})
post = hooks.get('PostToolUse', [])
print(f'PostToolUse hooks: {len(post)}')
for h in post:
    print(f'  - matcher: {h[\"matcher\"]} -> {h[\"description\"]}')"

# 2. Test in a Claude Code session
# Edit a file with a deliberate test failure
# Verify the hook output appears after the edit
```

### Checklist

- [ ] Git hooks installed (`.git/hooks/pre-commit` exists and is executable)
- [ ] Hook auto-install configured (`prepare` script or Makefile target)
- [ ] Pre-commit runs in under 10 seconds
- [ ] Only staged files are checked (not entire codebase)
- [ ] CI duplicates the same checks (lint, format, type-check)
- [ ] `.claude/settings.json` has `PostToolUse` hooks for `Edit|Write`
- [ ] Claude hooks run related tests after file edits
- [ ] Claude hooks run linter on newly written files
