# CI/CD Reference

GitHub Actions workflows that keep agent-generated code at the same quality bar as human code.

---

## Why CI Matters for Agents

AI coding agents produce code fast. They have no inherent quality gate. Without CI:

- A typo in an import breaks the build but the agent moves on.
- A type error slips through because the agent doesn't run `tsc`.
- A test regression goes unnoticed because nobody ran the suite.

CI is the safety net. Every PR, whether opened by a human or an agent, must pass the same pipeline. Agents that can read CI output can also self-correct: a failing check tells the agent exactly what to fix.

**Principle:** Agent changes face the same gates as human changes. Never weaken CI for bot PRs.

---

## What to Check

Before generating workflows, detect what already exists:

```
Glob: .github/workflows/*.yml
Glob: .github/workflows/*.yaml
```

Read each file. Identify:

| Question | Why |
|----------|-----|
| What triggers exist? (`on: push`, `pull_request`, etc.) | Avoid duplicate triggers |
| What language setup actions are used? | Match versions to existing config |
| What test/lint/build commands run? | Don't generate commands that conflict |
| Is there a `concurrency` block? | Prevent duplicate runs |
| Is there a `permissions` block? | Security baseline |

Also read the project manifest to learn the actual commands:

```
Read: package.json        # scripts.test, scripts.lint, scripts.build
Read: pyproject.toml       # [tool.pytest], [tool.ruff], [tool.mypy]
Read: Makefile             # common task targets
```

---

## The Three Workflows

Every agent-ready repo should have these GitHub Actions workflows:

| File | Purpose | Triggers |
|------|---------|----------|
| `ci.yml` | Lint, typecheck, test, build | `push`, `pull_request` |
| `claude.yml` | Claude Code Action for PR review and issue work | `pull_request`, `issue_comment` |
| `copilot-setup-steps.yml` | Environment setup for GitHub Copilot coding agent | `workflow_dispatch` only |

---

## 1. ci.yml

The core pipeline. Must match the project's actual build commands.

### Structure

Every ci.yml should have these stages in order:

1. **Lint** -- catch style and formatting issues early (fastest)
2. **Typecheck** -- catch type errors before running tests
3. **Test** -- run the full test suite
4. **Build** -- verify the project compiles/bundles

### JS/TS Example

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  ci:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm

      - run: npm ci

      - name: Lint
        run: npx biome check .
        # Or: npx eslint . --max-warnings 0

      - name: Typecheck
        run: npx tsc --noEmit

      - name: Test
        run: npx vitest run --coverage
        # Or: npx jest --coverage

      - name: Build
        run: npm run build
```

### Python Example

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  ci:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.12"]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
          cache: pip

      - name: Install dependencies
        run: pip install -e ".[dev]"
        # Or: pip install -r requirements-dev.txt

      - name: Lint
        run: ruff check .

      - name: Format check
        run: ruff format --check .

      - name: Typecheck
        run: mypy src/

      - name: Test
        run: pytest --tb=short -q
```

### Key Details

**Concurrency control** prevents wasted runner minutes. When you push a new commit to a PR branch, the previous run is cancelled:

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

**Permissions** should follow least privilege. Most CI jobs only need to read the repo:

```yaml
permissions:
  contents: read
```

**Version matrix** lets you test across runtimes. Start with one version and expand if the project supports multiple:

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
```

**Cache** speeds up dependency installation. Both `actions/setup-node@v4` and `actions/setup-python@v5` have built-in cache support:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm          # Caches ~/.npm

- uses: actions/setup-python@v5
  with:
    python-version: "3.12"
    cache: pip          # Caches ~/.cache/pip
```

---

## 2. claude.yml

The Claude Code Action lets Claude respond to `@claude` mentions in issue comments and automatically review PRs.

### Complete Example

```yaml
name: Claude Code

on:
  issue_comment:
    types: [created]
  pull_request:
    types: [opened, synchronize]

concurrency:
  group: claude-${{ github.event.issue.number || github.event.pull_request.number }}
  cancel-in-progress: true

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  claude:
    # Only run on @claude mentions or PR events
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          max_turns: 10
          max_tokens: 16384
```

### Key Details

**Triggers**: Two distinct triggers serve different purposes.

- `issue_comment` with the `@claude` filter lets humans ask Claude to work on issues or PR comments.
- `pull_request` with `opened` and `synchronize` lets Claude automatically review new and updated PRs.

**Secrets**: The `ANTHROPIC_API_KEY` must be added as a repository secret (Settings > Secrets and variables > Actions). Never hardcode it.

**Caps**: Always set `max_turns` and `max_tokens` to prevent runaway usage. Reasonable defaults:

- `max_turns: 10` -- enough for most review/fix cycles
- `max_tokens: 16384` -- sufficient for detailed reviews

**Permissions**: Claude needs write access to pull requests and issues to post comments. It only needs read access to contents.

**Concurrency**: Group by issue/PR number so that rapid `@claude` mentions don't stack up parallel runs.

---

## 3. copilot-setup-steps.yml

This workflow prepares the environment for GitHub Copilot's coding agent. It has strict naming requirements.

### Critical Requirements

1. **The job MUST be named `copilot-setup-steps`** (exact string). Copilot looks for this job name. Any other name and the agent cannot find its setup steps.
2. **Trigger MUST be `workflow_dispatch` only.** This workflow is called on demand by Copilot, not on push or PR.
3. **Steps**: checkout, setup language runtime, install dependencies, build. Nothing else needed.

### Node.js Example

```yaml
name: Copilot Setup Steps

on:
  workflow_dispatch:

jobs:
  copilot-setup-steps:          # <-- exact name required
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - run: npm run build
```

### Python Example

```yaml
name: Copilot Setup Steps

on:
  workflow_dispatch:

jobs:
  copilot-setup-steps:          # <-- exact name required
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip

      - run: pip install -e ".[dev]"
```

### Why workflow_dispatch Only

Copilot's coding agent invokes this workflow via the API when it needs to set up a working environment. If you add `push` or `pull_request` triggers, the workflow runs on every commit -- wasting runner minutes and providing no value since Copilot ignores those runs.

---

## What to Generate

When creating workflows for a specific project, always derive commands from the project itself:

### Step 1: Read the manifest

```
# Node.js
Read: package.json → scripts.lint, scripts.test, scripts.build, scripts.typecheck

# Python
Read: pyproject.toml → [tool.ruff], [tool.mypy], [tool.pytest]
Read: setup.cfg or setup.py → test dependencies
```

### Step 2: Map to workflow steps

| Manifest | Workflow step |
|----------|--------------|
| `"lint": "biome check ."` | `run: npm run lint` |
| `"test": "vitest run"` | `run: npm test` |
| `"build": "tsc"` | `run: npm run build` |
| `[tool.ruff]` in pyproject.toml | `run: ruff check .` |
| `[tool.mypy]` in pyproject.toml | `run: mypy src/` |
| `[tool.pytest]` in pyproject.toml | `run: pytest` |

### Step 3: Match language versions

Read the project's version constraints:

```
# Node.js
Read: package.json → engines.node
Read: .nvmrc or .node-version
Read: .tool-versions (asdf)

# Python
Read: pyproject.toml → [project] requires-python
Read: .python-version
Read: .tool-versions (asdf)
```

Use these values in `actions/setup-node` or `actions/setup-python` rather than guessing.

### Step 4: Check for monorepo structure

If the project has `packages/`, `apps/`, or a workspace config, the workflow may need:

- Working directory: `defaults: { run: { working-directory: packages/core } }`
- Multiple CI jobs per package
- Path-based trigger filtering

---

## Common Mistakes

### 1. Generic test commands

Wrong:
```yaml
- run: npm test            # What if tests use vitest with special flags?
```

Right -- read `package.json` first:
```yaml
- run: npx vitest run --coverage    # Matches project's actual test runner
```

### 2. Running copilot-setup-steps on every push

Wrong:
```yaml
on:
  push:                    # Wastes runner minutes on every commit
    branches: [main]
  workflow_dispatch:
```

Right:
```yaml
on:
  workflow_dispatch:       # Only runs when Copilot requests it
```

### 3. Wrong job name for copilot-setup-steps

Wrong:
```yaml
jobs:
  setup:                   # Copilot cannot find this
    runs-on: ubuntu-latest
```

Right:
```yaml
jobs:
  copilot-setup-steps:     # Exact name required
    runs-on: ubuntu-latest
```

### 4. Missing concurrency groups

Wrong (no concurrency block):
```yaml
on:
  pull_request:
jobs:
  ci:
    runs-on: ubuntu-latest
    # Five rapid pushes = five parallel runs burning minutes
```

Right:
```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

### 5. Missing permissions block

Wrong (inherits default, often overly broad):
```yaml
jobs:
  ci:
    runs-on: ubuntu-latest
```

Right:
```yaml
permissions:
  contents: read

jobs:
  ci:
    runs-on: ubuntu-latest
```

### 6. Skipping CI for bot PRs

Wrong:
```yaml
jobs:
  ci:
    if: github.actor != 'dependabot[bot]' && github.actor != 'claude[bot]'
```

Agent PRs need the same quality gates as human PRs. If CI is too slow for rapid iteration, fix CI speed -- do not skip it.

### 7. Hardcoded secrets

Wrong:
```yaml
- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: sk-ant-abc123...    # Exposed in repo
```

Right:
```yaml
- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

### 8. Using outdated action versions

Wrong:
```yaml
- uses: actions/setup-node@v3       # Outdated
- uses: actions/setup-python@v4     # Outdated
```

Right:
```yaml
- uses: actions/setup-node@v4       # Current
- uses: actions/setup-python@v5     # Current
```

---

## Verification

After generating workflows, confirm they work:

### Syntax check

```bash
# Validate YAML syntax (requires actionlint)
actionlint .github/workflows/ci.yml
actionlint .github/workflows/claude.yml
actionlint .github/workflows/copilot-setup-steps.yml
```

### Structural checks

Verify these properties by reading the generated files:

| Check | Expected |
|-------|----------|
| `ci.yml` triggers include `pull_request` | Yes |
| `ci.yml` has `concurrency` block | Yes |
| `ci.yml` has `permissions` block | Yes |
| `ci.yml` lint/test/build commands match package.json or pyproject.toml | Yes |
| `ci.yml` language version matches project constraints | Yes |
| `claude.yml` uses `${{ secrets.ANTHROPIC_API_KEY }}` | Yes, never hardcoded |
| `claude.yml` has `max_turns` set | Yes |
| `claude.yml` has `max_tokens` set | Yes |
| `claude.yml` `if` condition filters for `@claude` | Yes |
| `copilot-setup-steps.yml` job is named `copilot-setup-steps` | Yes, exact match |
| `copilot-setup-steps.yml` trigger is `workflow_dispatch` only | Yes, no push/PR |

### Runtime check

Push a branch and open a PR to trigger `ci.yml`. Confirm all steps pass. If any fail, the workflow commands don't match the project -- go back to the manifest and fix them.

---

## Quick Checklist

Use this when reviewing or generating CI/CD for a repo:

- [ ] `ci.yml` exists with lint, typecheck, test, build steps
- [ ] Commands in `ci.yml` match the project's actual scripts
- [ ] Language version matches `.nvmrc`, `engines.node`, or `requires-python`
- [ ] Concurrency group is set with `cancel-in-progress: true`
- [ ] Permissions block follows least privilege
- [ ] `claude.yml` exists with `anthropics/claude-code-action@v1`
- [ ] `claude.yml` uses secrets for API key, sets max_turns and max_tokens
- [ ] `claude.yml` triggers on `issue_comment` (filtered for `@claude`) and `pull_request`
- [ ] `copilot-setup-steps.yml` job is named exactly `copilot-setup-steps`
- [ ] `copilot-setup-steps.yml` triggers on `workflow_dispatch` only
- [ ] No CI skipping for bot/agent PRs
- [ ] Using `actions/setup-node@v4` and `actions/setup-python@v5`
