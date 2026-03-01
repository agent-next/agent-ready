# Agent-Ready v2: Pivot Design

## Core Insight

Agent-ready is NOT a standalone program that generates files. It is a **knowledge layer** that teaches AI agents how to set up repos properly. The agent (Claude Code, Copilot, Gemini CLI) is the intelligence — it can already read code, write files, call APIs. It just doesn't know **what a well-set-up repo looks like**. Agent-ready teaches it that.

```
Agent-ready = curriculum (what to set up, why, what good looks like)
Agent       = student who already knows how to code
```

**From**: "Factory-compatible repo maturity scanner" (score repos)
**To**: "The teacher that guides agents to set up repos properly"

## Product Architecture

```
┌──────────────────────────────────────────────────┐
│                   AI AGENT                        │
│          (Claude Code / Copilot / Gemini)         │
│                                                   │
│   Already can: read code, write files, call APIs  │
│   Needs to learn: what a good repo setup is       │
└───────────┬────────────────────────┬──────────────┘
            │ reads                  │ calls
            ▼                       ▼
    ┌───────────────┐      ┌────────────────┐
    │    SKILL      │      │   MCP / CLI    │
    │  (knowledge)  │      │ (verification) │
    │               │      │                │
    │  • 9 areas    │      │ • check: what  │
    │  • best       │      │   is missing?  │
    │    practices  │      │ • returns JSON │
    │  • examples   │      │   checklist    │
    │  • BDT method │      │                │
    └───────────────┘      └────────────────┘
```

### Three Deliverables

| Deliverable | What | Role |
|-------------|------|------|
| **Skill** (SKILL.md + references) | The knowledge base — 9 areas, best practices, examples, common mistakes | Teaches the agent what to do |
| **MCP tools** | `check_repo_readiness` — scans repo, returns structured checklist of what exists and what's missing | Gives the agent eyes into the current state |
| **CLI / GitHub Action** | `agent-ready check .` — lightweight verification for CI or human spot-checks | Quality gate in pipelines |

## The Skill (Main Product)

The skill is what the agent reads to learn how to set up a repo. It teaches 9 areas, organized by what the agent needs to know for each:

### Structure

```
skill/agent-ready/
├── SKILL.md                          # Entry point: overview + workflow
├── references/
│   ├── agent-guidance.md             # How to write AGENTS.md, CLAUDE.md, etc.
│   ├── code-quality.md               # Linting, formatting, type checking
│   ├── testing/                      # BDT methodology (existing, 1911 lines)
│   │   ├── testing-principles.md
│   │   ├── analysis-phase.md
│   │   ├── design-phase.md
│   │   ├── execution-phase.md
│   │   ├── branch-matrices.md
│   │   └── test-templates.md
│   ├── ci-cd.md                      # GitHub Actions workflows
│   ├── hooks.md                      # Pre-commit + Claude Code hooks
│   ├── branch-rulesets.md            # GitHub rulesets (not legacy protection)
│   ├── repo-templates.md             # Issue forms, PR template, CODEOWNERS
│   ├── devcontainer.md               # Container config for agent isolation
│   └── security.md                   # Dependabot, push protection, CodeQL
└── examples/
    ├── typescript-webapp/            # Complete example for a TS webapp
    ├── python-cli/                   # Complete example for a Python CLI
    └── monorepo/                     # Complete example for a monorepo
```

### What Each Reference Teaches

Each reference doc follows the same structure:

1. **Why** — why this matters for agent-guided development
2. **What to check** — how to detect what's already in the repo
3. **What good looks like** — concrete examples of well-configured files
4. **What to generate** — what to create if missing, adapted to the project
5. **Common mistakes** — what NOT to do
6. **Verification** — how to confirm it's working

The agent reads these, analyzes the actual project, and generates project-specific configs. NOT templates — intelligent output because the agent understands both the standards AND the specific project.

### SKILL.md Workflow

The skill teaches this workflow:

```
1. ANALYZE the project
   - Read package.json / pyproject.toml
   - Detect language, framework, project type
   - Identify existing infra (what's already set up)
   - Understand architecture (entry points, modules, test structure)

2. CHECK what's missing
   - Call check_repo_readiness MCP tool (or run agent-ready check .)
   - Get structured JSON of present/missing items per area

3. SET UP each missing area
   - For each gap, read the relevant reference doc
   - Generate project-specific config (not a template — use your understanding of THIS project)
   - Write files, install dependencies, call GitHub APIs as needed

4. VERIFY everything works
   - Run linters, tests, type checks
   - Confirm CI workflows are valid YAML
   - Check that branch rulesets are active
```

## The 9 Areas

### 1. Agent Guidance
**Files**: AGENTS.md, CLAUDE.md, .github/copilot-instructions.md, .cursor/rules/, .github/instructions/*.instructions.md

**What the skill teaches**:
- AGENTS.md is the cross-tool standard (60k+ repos). 6 sections: commands, testing, project structure, code style, git workflow, boundaries.
- CLAUDE.md imports AGENTS.md via `@AGENTS.md`, adds Claude-specific hooks.
- Copilot instructions: concise, max 2 pages.
- Scoped instructions (`.github/instructions/`) with YAML frontmatter `applyTo` globs.
- Content must be project-specific — describe THIS project's architecture, not generic boilerplate.

**What the agent does** (NOT what agent-ready does):
- Reads the actual codebase, understands the architecture
- Writes AGENTS.md describing the real commands, real structure, real conventions
- Generates CLAUDE.md that references the real test command, real build command

### 2. Code Quality
**Tools**: Biome (JS/TS) or Ruff+mypy (Python), .editorconfig

**What the skill teaches**:
- Modern tooling: Biome replaces ESLint+Prettier (10-20x faster). Ruff replaces black+isort+flake8.
- Don't put style rules in agent guidance files — use a formatter.
- Detect existing tools before installing new ones. Don't add Biome if ESLint is already configured.
- Type checking: TypeScript strict mode, mypy for Python.

### 3. Testing (BDT)
**Methodology**: Behavior-Driven Testing — start from user behavior, not code structure.

**What the skill teaches** (1911 lines of references, already merged):
- Analysis → Design → Execution workflow
- Branch matrices: P0 (must test) and P1 (should test) categories
- Must-test branches: empty values, boundaries, auth states, API responses, user chaos
- Test templates for unit, integration, E2E
- Common mistakes: only happy path, skip empty values, mock everything, ignore loading states

### 4. CI/CD
**Workflows**: ci.yml, claude.yml, copilot-setup-steps.yml

**What the skill teaches**:
- CI must match the actual project build (not generic `npm test` if the project uses `vitest`)
- Claude Code Action (`anthropics/claude-code-action@v1`) for PR review via `@claude`
- `copilot-setup-steps.yml`: job must be named `copilot-setup-steps` exactly, trigger: `workflow_dispatch` only
- Concurrency control: cancel in-progress runs on same PR

### 5. Hooks
**Tools**: Lefthook/Husky (git hooks) + Claude Code hooks (PostToolUse)

**What the skill teaches**:
- Git hooks = gate commits. Claude hooks = gate every edit. Both needed.
- Lefthook: parallel execution, 2x faster than Husky, works without Node (good for Python)
- Claude `PostToolUse` hook on `Edit|Write`: auto-run tests after every file change
- Don't put slow checks (full type check) in pre-commit — use CI for that

### 6. Branch Rulesets
**Config**: GitHub Rulesets via REST API (not legacy branch protection)

**What the skill teaches**:
- Rulesets are the modern GitHub standard (multiple can stack, org-level, evaluate mode)
- Essential rules: require PR, require review, dismiss stale approvals, require status checks, prevent deletion, prevent force push
- Agent identity: agents must never bypass PR requirements
- API: `gh api repos/{owner}/{repo}/rulesets --method POST --input -`
- Fallback: if no permissions, output the command for manual execution

### 7. Repo Templates
**Files**: Issue forms (YAML), PR template, CODEOWNERS, CONTRIBUTING.md, SECURITY.md, LICENSE, .gitignore, .gitattributes

**What the skill teaches**:
- Issue forms (YAML) > issue templates (Markdown) — structured fields are easier for agents to parse
- CODEOWNERS: last matching pattern wins (not first)
- .gitignore: language-appropriate patterns
- .gitattributes: normalize line endings (LF for source, binary for images)

### 8. DevContainer
**Config**: .devcontainer/devcontainer.json

**What the skill teaches**:
- DevContainers provide reproducible agent environments — eliminates "works on my machine"
- In a properly isolated container, agents can run with `--dangerously-skip-permissions` safely
- Include build tools and linters, not personal preferences
- postCreateCommand for one-time setup (npm install, pip install)
- Use same image in CI for parity

### 9. Security
**Features**: Dependabot, push protection, CodeQL, SECURITY.md

**What the skill teaches**:
- Push protection is #1 priority (proactive — blocks secrets before they land). Free for public repos.
- Dependabot: use grouped updates to avoid PR overload
- CodeQL default setup: auto-detects languages, no config file needed
- Secret scanning: enabled by default on public repos since 2024

## MCP Tools

Lightweight verification tools the agent calls to understand current state.

### `check_repo_readiness`

**Input**: `{ path: string }`
**Output**:
```json
{
  "project_type": "typescript-webapp",
  "language": "typescript",
  "areas": {
    "agent_guidance": {
      "status": "partial",
      "present": ["AGENTS.md"],
      "missing": ["CLAUDE.md", ".github/copilot-instructions.md", ".github/workflows/copilot-setup-steps.yml"]
    },
    "code_quality": {
      "status": "complete",
      "present": ["eslint.config.js", ".prettierrc", "tsconfig.json (strict)", ".editorconfig"]
    },
    "testing": {
      "status": "partial",
      "present": ["vitest.config.ts", "tests/"],
      "missing": ["coverage thresholds", "BDT branch matrix"]
    },
    "ci_cd": {
      "status": "partial",
      "present": [".github/workflows/ci.yml"],
      "missing": [".github/workflows/claude.yml", ".github/workflows/copilot-setup-steps.yml"]
    },
    "hooks": {
      "status": "partial",
      "present": [".husky/pre-commit"],
      "missing": [".claude/settings.json (PostToolUse hook)"]
    },
    "branch_rulesets": {
      "status": "unknown",
      "note": "Requires gh CLI to check. Run: gh api repos/{owner}/{repo}/rulesets"
    },
    "templates": {
      "status": "partial",
      "present": [".github/ISSUE_TEMPLATE/", ".github/PULL_REQUEST_TEMPLATE.md"],
      "missing": ["YAML issue forms (currently Markdown)", ".github/CODEOWNERS"]
    },
    "devcontainer": {
      "status": "complete",
      "present": [".devcontainer/devcontainer.json"]
    },
    "security": {
      "status": "partial",
      "present": [".github/dependabot.yml", "SECURITY.md"],
      "missing": ["push protection (check via gh api)"]
    }
  }
}
```

This output is what the agent uses to decide what to set up. The agent reads the relevant skill reference for each missing area, then generates project-specific configs.

## CLI / GitHub Action

Thin wrapper around the MCP tool for human use and CI gates.

```bash
# Human spot-check
$ agent-ready check .
9 areas: 2 complete, 6 partial, 1 unknown
Missing: CLAUDE.md, copilot-instructions.md, claude.yml, YAML issue forms, ...

# CI gate
$ agent-ready check . --json --strict
# exit code 1 if anything missing
```

GitHub Action:
```yaml
- uses: agent-next/agent-ready@v2
  with:
    mode: check
    fail-on-missing: true
```

## What Changes in the Codebase

### Kill List
| Module | Why |
|--------|-----|
| `profiles/factory_compat.yaml` (2393 lines) | Scoring framework gone |
| `src/engine/level-gate.ts` | L1-L5 levels gone |
| `src/scanner.ts` | Replace with lightweight checker |
| `src/commands/scan.ts` | Replace with `check` command |
| `src/output/markdown.ts` | Replace with simple terminal output |
| `src/profiles/` | No more profile loading |
| `skill/agent-ready/references/levels.md` | Levels gone |
| `skill/agent-ready/references/scoring-rubric.md` | Scoring gone |
| `skill/agent-ready/references/analysis-patterns.md` | Replace with per-area references |
| `skill/agent-ready/references/pillars.md` | Replace with per-area references |

### Keep List
| Module | Role in v2 |
|--------|-----------|
| `src/engine/project-type.ts` | Project type detection for `check` tool |
| `src/engine/context.ts` | Context builder (add language, pyproject.toml) |
| `src/checks/` | Reuse for `check` command (file-exists, path-glob, dependency-detect) |
| `src/utils/` | Direct reuse |
| `src/i18n/` | Direct reuse |
| `skill/agent-ready/references/testing/` | BDT methodology (1911 lines, keep as-is) |
| `test/fixtures/` | Keep and extend |
| `packages/mcp/` | Rebuild with `check_repo_readiness` tool |
| `action.yml` | Refactor for `check` mode |

### New Files
| File | Purpose |
|------|---------|
| `skill/agent-ready/SKILL.md` | Rewrite: workflow + 9 area overview |
| `skill/agent-ready/references/agent-guidance.md` | How to write AGENTS.md, CLAUDE.md, etc. |
| `skill/agent-ready/references/code-quality.md` | Linting, formatting, type checking |
| `skill/agent-ready/references/ci-cd.md` | GitHub Actions workflows |
| `skill/agent-ready/references/hooks.md` | Pre-commit + Claude hooks |
| `skill/agent-ready/references/branch-rulesets.md` | GitHub rulesets |
| `skill/agent-ready/references/repo-templates.md` | Issue forms, PR template, CODEOWNERS |
| `skill/agent-ready/references/devcontainer.md` | Container config |
| `skill/agent-ready/references/security.md` | Dependabot, push protection, CodeQL |
| `skill/agent-ready/examples/` | Complete examples per project type |
| `src/commands/check.ts` | CLI check command |
| `packages/mcp/src/tools/check.ts` | MCP check_repo_readiness tool |

## Build Sequence

### Phase 1: Skill (the knowledge)
1. Rewrite SKILL.md with new workflow
2. Write 7 new reference docs (agent-guidance, code-quality, ci-cd, hooks, branch-rulesets, repo-templates, devcontainer, security)
3. Keep existing BDT testing references as-is
4. Create examples/ with complete project-type examples
5. Test: use the skill on 3 different real repos manually to validate

### Phase 2: Check tool (the verification)
6. Add language detection to ScanContext
7. Add pyproject.toml loading to ScanContext
8. Build `check_repo_readiness` logic (reuse existing checks)
9. Wire up CLI `check` command
10. Wire up MCP `check_repo_readiness` tool
11. Tests for check logic

### Phase 3: Cleanup + distribution
12. Delete scanner, profiles, level-gate, scoring
13. Refactor action.yml for check mode
14. Rewrite README
15. npm publish v2.0.0

## Success Criteria

- An agent using the skill can set up a bare repo with all 9 areas configured — project-specific, not generic templates
- `check_repo_readiness` returns accurate JSON for any JS/TS or Python project
- The skill is < 500 lines in SKILL.md (references can be longer, loaded on demand)
- Running the skill on agent-ready's own repo produces configs matching what we manually created
- BDT methodology is preserved and integrated as the testing reference
