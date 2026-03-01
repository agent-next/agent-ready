# Agent-Ready v2: Pivot Design

## Summary

Pivot agent-ready from a passive repo maturity scanner to an active repo infrastructure setup tool for agent-guided development. One command sets up everything an agent needs before writing code. Idempotent — first run does full setup, subsequent runs fill gaps.

**From**: "Factory-compatible repo maturity scanner" (score repos L1-L5)
**To**: "Everything except the code" (set up all repo infra for agents)

## Product Identity

- **Package**: `agent-ready` (keep npm, GitHub Action, Marketplace identity)
- **Description**: "Everything except the code — one command to make any repo agent-ready"
- **Commands**:
  - `agent-ready setup .` — detect project type, generate all infra, configure GitHub
  - `agent-ready check .` — verify setup completeness, JSON output for agent pre-flight
- **Distribution**: CLI (`npx`), GitHub Action, MCP server
- **Interaction**: Fully autonomous, opinionated defaults, override via flags or `.agent-ready.yml`
- **Languages**: JS/TS + Python at launch

## Architecture: Modular Providers

```
CLI (setup/check)
    ↓
SetupEngine
    ├─ detect project type (reuse src/engine/project-type.ts)
    ├─ build context (reuse src/engine/context.ts)
    ├─ run providers in order:
    │
    ├─ 1. AgentGuidanceProvider
    ├─ 2. CodeQualityProvider
    ├─ 3. TestingProvider
    ├─ 4. CIProvider
    ├─ 5. HooksProvider
    ├─ 6. BranchRulesetProvider
    ├─ 7. TemplatesProvider
    ├─ 8. DevContainerProvider
    ├─ 9. SecurityProvider
    │
    └─ output results (JSON envelope)
```

### Provider Interface

Every provider implements:

```typescript
interface Provider {
  name: string;
  detect(ctx: ScanContext): Promise<ProviderState>;  // what exists
  plan(ctx: ScanContext, state: ProviderState): Promise<Action[]>;  // what's missing
  apply(ctx: ScanContext, actions: Action[]): Promise<Result[]>;  // create/configure
  verify(ctx: ScanContext): Promise<VerifyResult>;  // confirm it worked
}

interface Action {
  type: 'create_file' | 'modify_file' | 'api_call' | 'install_dep' | 'run_command';
  target: string;       // file path or API endpoint
  description: string;  // human-readable
  content?: string;     // file content or API payload
}

interface Result {
  action: Action;
  status: 'applied' | 'skipped' | 'failed';
  reason?: string;
}
```

### Output Format

JSON envelope (consistent with pm-sim pattern):

```json
{
  "ok": true,
  "data": {
    "project_type": "webapp",
    "language": "typescript",
    "applied": [
      {"provider": "agent_guidance", "action": "create_file", "target": "AGENTS.md"},
      {"provider": "ci", "action": "create_file", "target": ".github/workflows/ci.yml"}
    ],
    "skipped": [
      {"provider": "code_quality", "action": "create_file", "target": "biome.json", "reason": "eslint.config.js already exists"}
    ],
    "failed": [],
    "summary": "9 applied, 2 skipped, 0 failed"
  }
}
```

## Provider Specifications

### 1. AgentGuidanceProvider

**Purpose**: Generate all agent instruction files tailored to the detected project.

**Detects**: Existing AGENTS.md, CLAUDE.md, .github/copilot-instructions.md, .cursor/rules/, .github/instructions/*.instructions.md

**Generates** (if missing):

| File | Content Source |
|------|---------------|
| `AGENTS.md` | Analyzes project structure, package.json/pyproject.toml, test commands, build commands. Generates 6 sections: commands, testing, project structure, code style, git workflow, boundaries. Cross-tool standard. |
| `CLAUDE.md` | Imports AGENTS.md via `@AGENTS.md`, adds Claude-specific hooks config reference. |
| `.github/copilot-instructions.md` | Concise subset of AGENTS.md for Copilot. Max 2 pages. |
| `.github/instructions/*.instructions.md` | Path-scoped instructions with YAML frontmatter `applyTo` globs. One per major directory (src/, tests/, etc.) |
| `.cursor/rules/project.mdc` | Cursor project rules derived from AGENTS.md. |

**Idempotent behavior**: If file exists, skip. Never overwrite user content.

### 2. CodeQualityProvider

**Purpose**: Install and configure linters, formatters, type checkers.

**Detection logic**:

| Language | Detect Via | Install |
|----------|-----------|---------|
| TypeScript | `tsconfig.json` | Biome (lint+format). If ESLint already exists, skip. |
| JavaScript | `package.json` without tsconfig | Biome (lint+format) |
| Python | `pyproject.toml` or `setup.py` | Ruff (lint+format) + mypy (types) |

**Generates**:

| File | When |
|------|------|
| `biome.json` | JS/TS project, no existing ESLint |
| `pyproject.toml [tool.ruff]` section | Python project, no existing ruff config |
| `pyproject.toml [tool.mypy]` section | Python project, no existing mypy config |
| `.editorconfig` | Always if missing |

**Installs** (via npm/pip):
- JS/TS: `@biomejs/biome` as devDependency
- Python: `ruff`, `mypy` as dev dependencies (via `uv add --dev` or `pip install`)

### 3. TestingProvider

**Purpose**: Scaffold test infrastructure and BDT methodology.

**Detection**: Existing test directories, test config files, coverage config.

**Generates**:

| Item | JS/TS | Python |
|------|-------|--------|
| Test runner config | `vitest.config.ts` (or detect existing jest/mocha) | `pyproject.toml [tool.pytest]` |
| Directory structure | `tests/unit/`, `tests/integration/`, `tests/e2e/` | `tests/unit/`, `tests/integration/`, `tests/e2e/` |
| Coverage config | vitest coverage settings | `pytest-cov` config |
| BDT template | `tests/BRANCH_MATRIX.md` | `tests/BRANCH_MATRIX.md` |
| Conftest/setup | `tests/setup.ts` | `tests/conftest.py` |

**BDT integration**: Copies branch matrix template from existing `skill/agent-ready/references/testing/branch-matrices.md` into the project. This is agent-ready's differentiator — no other setup tool includes a testing methodology.

### 4. CIProvider

**Purpose**: Generate GitHub Actions workflows.

**Generates**:

| Workflow | Purpose | Trigger |
|----------|---------|---------|
| `.github/workflows/ci.yml` | lint + typecheck + test + build | push, pull_request |
| `.github/workflows/claude.yml` | Claude Code Action (PR review + @claude mentions) | issue_comment, pull_request |
| `.github/workflows/copilot-setup-steps.yml` | Copilot coding agent environment setup | workflow_dispatch, push, pull_request |

**CI workflow** is language-aware:
- JS/TS: setup-node, npm ci, biome check, tsc --noEmit, vitest, build
- Python: setup-python, uv install, ruff check, mypy, pytest

**Claude workflow** uses `anthropics/claude-code-action@v1` with sensible defaults.

**Copilot setup steps** installs project dependencies so Copilot coding agent can work.

### 5. HooksProvider

**Purpose**: Set up pre-commit hooks (git) and Claude Code hooks.

**Detection**: Existing .husky/, lefthook.yml, .pre-commit-config.yaml, .claude/settings.json

**Strategy**:
- JS/TS: Lefthook (faster than Husky, parallel execution). Falls back to Husky if already installed.
- Python: Lefthook (no Node dependency needed) or pre-commit framework if already present.

**Generates**:

| File | Content |
|------|---------|
| `lefthook.yml` | pre-commit: lint + format + typecheck on staged files |
| `.claude/settings.json` | PostToolUse hook: run tests after Edit/Write |

**Git hooks** gate commits. **Claude hooks** gate every edit. Both needed.

### 6. BranchRulesetProvider

**Purpose**: Configure GitHub branch rulesets via REST API.

**Uses rulesets** (not legacy branch protection rules). Rulesets are the current GitHub standard.

**Rules applied to `main`/`master`**:

| Rule | Purpose |
|------|---------|
| `pull_request` | Require PR, 1 approval, dismiss stale reviews, resolve threads |
| `required_status_checks` | CI must pass before merge |
| `deletion` | Prevent branch deletion |
| `non_fast_forward` | Prevent force push |

**Implementation**: `gh api repos/{owner}/{repo}/rulesets --method POST --input -`

**Fallback**: If `gh` CLI not available or insufficient permissions, output the `gh api` command for manual execution.

### 7. TemplatesProvider

**Purpose**: Generate GitHub repo templates.

**Generates** (if missing):

| File | Format |
|------|--------|
| `.github/ISSUE_TEMPLATE/bug_report.yml` | YAML issue form (not Markdown template — structured fields are easier for agents) |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | YAML issue form |
| `.github/ISSUE_TEMPLATE/config.yml` | Template chooser config |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR template with checklist |
| `.github/CODEOWNERS` | Default: `* @{repo-owner}` |
| `.gitignore` | Language-appropriate (gitignore.io patterns) |
| `.gitattributes` | Line ending normalization |
| `CONTRIBUTING.md` | Standard contributing guide |
| `SECURITY.md` | Vulnerability disclosure policy |
| `LICENSE` | MIT (default, configurable) |

### 8. DevContainerProvider

**Purpose**: Generate devcontainer config for reproducible agent environments.

**Generates**:

| File | Content |
|------|---------|
| `.devcontainer/devcontainer.json` | Language-appropriate base image, extensions, postCreateCommand |

**JS/TS container**: Node 20, Biome extension, GitHub CLI
**Python container**: Python 3.12, Ruff extension, GitHub CLI

### 9. SecurityProvider

**Purpose**: Enable GitHub security features.

**Generates**:

| Item | Method |
|------|--------|
| `.github/dependabot.yml` | Create file — grouped updates, weekly schedule |
| Secret scanning + push protection | `gh api` — enable on repo (free for public repos) |
| CodeQL default setup | `gh api` — enable default setup (auto-detects languages) |

**Fallback**: If API calls fail (permissions), output commands for manual execution.

## What Gets Deleted

| Current Module | Reason |
|----------------|--------|
| `profiles/factory_compat.yaml` (2393 lines) | Scoring framework no longer needed |
| `src/engine/level-gate.ts` | L1-L5 levels removed |
| `src/scanner.ts` | Replaced by SetupEngine |
| `src/commands/scan.ts` | Replaced by setup/check commands |
| `src/output/markdown.ts` | Replaced by JSON envelope + simple CLI output |
| `src/profiles/` | No more profile loading |
| `skill/agent-ready/references/levels.md` | Levels removed |
| `skill/agent-ready/references/scoring-rubric.md` | Scoring removed |
| `skill/agent-ready/references/analysis-patterns.md` | Analysis patterns removed |

## What Gets Kept (and refactored)

| Current Module | Reuse |
|----------------|-------|
| `src/engine/project-type.ts` | Direct reuse — project type detection is the foundation |
| `src/engine/context.ts` | Direct reuse — scan context, monorepo detection |
| `src/checks/` (11 check types) | Reuse as primitives inside providers for detect/verify |
| `src/utils/` (fs, git, exec, yaml) | Direct reuse |
| `src/i18n/` | Direct reuse |
| `src/types.ts` | Refactor — remove Level/Pillar types, add Provider types |
| `test/fixtures/` | Keep and extend |
| `packages/mcp/` | Rebuild tools around setup/check |
| `skill/agent-ready/references/testing/` | Keep BDT references (1911 lines, just merged) |
| `action.yml` | Refactor inputs (mode: setup/check instead of fail-below-level) |
| `package.json` | Keep identity, update scripts |

## New Directory Structure

```
agent-ready/
├── src/
│   ├── index.ts                    # CLI entry (commander)
│   ├── lib.ts                      # Public API exports
│   ├── types.ts                    # Provider, Action, Result types
│   ├── commands/
│   │   ├── setup.ts                # setup command
│   │   └── check.ts                # check command
│   ├── engine/
│   │   ├── setup-engine.ts         # Orchestrator: runs providers in order
│   │   ├── context.ts              # (kept) Scan context builder
│   │   ├── project-type.ts         # (kept) Project type detection
│   │   └── index.ts
│   ├── providers/
│   │   ├── index.ts                # Provider registry
│   │   ├── agent-guidance.ts       # AGENTS.md, CLAUDE.md, copilot-instructions, cursor rules
│   │   ├── code-quality.ts         # Biome/Ruff, mypy/tsc, editorconfig
│   │   ├── testing.ts              # Test scaffold, BDT, coverage config
│   │   ├── ci.ts                   # GitHub Actions workflows
│   │   ├── hooks.ts                # Lefthook/Husky + Claude hooks
│   │   ├── branch-ruleset.ts       # GitHub rulesets via API
│   │   ├── templates.ts            # Issue forms, PR template, CODEOWNERS, etc.
│   │   ├── devcontainer.ts         # .devcontainer/devcontainer.json
│   │   └── security.ts             # Dependabot, secret scanning, CodeQL
│   ├── checks/                     # (kept) Check primitives
│   ├── i18n/                       # (kept) Internationalization
│   └── utils/                      # (kept) FS, git, exec, yaml
├── templates/                      # File templates (Mustache/Handlebars)
│   ├── agents-md/                  # AGENTS.md templates per project type
│   ├── claude-md/                  # CLAUDE.md templates
│   ├── ci/                         # Workflow templates
│   ├── hooks/                      # lefthook.yml, .claude/settings.json
│   ├── testing/                    # Test scaffolds, BDT branch matrix
│   ├── devcontainer/               # devcontainer.json templates
│   ├── github/                     # Issue forms, PR template, CODEOWNERS
│   └── security/                   # dependabot.yml, SECURITY.md
├── packages/
│   ├── mcp/                        # MCP server (rebuilt)
│   │   └── src/tools/
│   │       ├── setup.ts            # agent_ready_setup tool
│   │       └── check.ts            # agent_ready_check tool
│   └── plugin/                     # Claude plugin (rebuilt)
├── skill/
│   └── agent-ready/
│       ├── SKILL.md                # Updated for setup/check flow
│       └── references/
│           └── testing/            # (kept) BDT reference docs
├── test/
│   ├── providers/                  # One test file per provider
│   ├── engine.test.ts
│   ├── e2e/
│   └── fixtures/                   # (kept + extended)
├── action.yml                      # GitHub Action (refactored)
├── package.json
└── README.md                       # Rewritten
```

## CLI UX

```bash
# Full setup (autonomous, opinionated)
$ npx agent-ready setup .

agent-ready v2.0.0
Detected: TypeScript webapp (Next.js)

  [+] AGENTS.md                          created
  [+] CLAUDE.md                          created
  [+] .github/copilot-instructions.md    created
  [+] .github/instructions/src.md        created
  [+] biome.json                         created
  [=] eslint.config.js                   skipped (exists)
  [+] .editorconfig                      created
  [+] tests/unit/                        created
  [+] tests/BRANCH_MATRIX.md             created
  [+] .github/workflows/ci.yml           created
  [+] .github/workflows/claude.yml       created
  [+] .github/workflows/copilot-setup-steps.yml  created
  [+] lefthook.yml                       created
  [+] .claude/settings.json              created
  [+] branch ruleset "main-protection"   applied via API
  [+] .github/ISSUE_TEMPLATE/bug.yml     created
  [+] .github/PULL_REQUEST_TEMPLATE.md   created
  [+] .github/CODEOWNERS                 created
  [+] .devcontainer/devcontainer.json    created
  [+] .github/dependabot.yml             created
  [+] push protection                    enabled via API
  [!] CodeQL default setup               failed (needs admin access)

21 applied, 1 skipped, 1 failed

# Verify (agent pre-flight)
$ npx agent-ready check .
{"ok": true, "data": {"complete": true, "missing": ["codeql"], ...}}

# Override defaults
$ npx agent-ready setup . --no-devcontainer --hook-framework=husky
```

## GitHub Action (refactored)

```yaml
name: Agent Ready
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: agent-next/agent-ready@v2
        with:
          mode: check        # or 'setup' for CI-driven setup
          fail-on-missing: true
```

## MCP Server Tools (rebuilt)

| Tool | Purpose |
|------|---------|
| `agent_ready_setup` | Run full setup on a repo path |
| `agent_ready_check` | Pre-flight check, return JSON status |

## Config File (optional override)

```yaml
# .agent-ready.yml
devcontainer: false
hook_framework: husky        # default: lefthook
license: Apache-2.0          # default: MIT
skip_providers:
  - branch_ruleset           # skip if no gh CLI
extra_codeowners:
  "src/api/**": "@backend-team"
```

## Migration Path

1. v0.1.0 (current) remains on npm as-is
2. v2.0.0 ships with new setup/check commands
3. `scan` command removed (breaking change, hence major version)
4. GitHub Action inputs change (mode replaces fail-below-level)
5. Marketplace listing updated

## Build Sequence

Phase 1 — Core engine + 3 providers:
1. Provider interface + types
2. SetupEngine orchestrator
3. AgentGuidanceProvider (AGENTS.md, CLAUDE.md, copilot-instructions)
4. CodeQualityProvider (Biome/Ruff)
5. TestingProvider (scaffold + BDT)
6. `setup` and `check` CLI commands
7. Tests for all above

Phase 2 — Remaining providers:
8. CIProvider (workflows)
9. HooksProvider (lefthook + claude hooks)
10. TemplatesProvider (issue forms, PR template, CODEOWNERS)
11. SecurityProvider (dependabot.yml)
12. DevContainerProvider
13. Tests for all above

Phase 3 — API + distribution:
14. BranchRulesetProvider (gh api calls)
15. MCP server rebuild
16. GitHub Action refactor
17. README rewrite
18. npm publish v2.0.0

## Success Criteria

- `npx agent-ready setup .` on a bare repo produces a fully configured project in < 10 seconds
- `npx agent-ready check .` returns valid JSON that an agent can parse for pre-flight
- Idempotent: running setup twice produces no changes on second run
- Every provider has unit tests with fixture repos
- BDT branch matrix is included in every project's test scaffold
