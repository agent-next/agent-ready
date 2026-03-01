# Agent-Ready v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform agent-ready from a repo maturity scanner into a best practices collection for high-quality GitHub repos + coding agent workflows. Skill is the product, MCP check tool is the verification layer.

**Architecture:** Skill (SKILL.md + 8 reference docs + BDT testing refs) teaches agents what a well-set-up repo looks like. MCP `check_repo_readiness` tool scans a repo and returns structured JSON of what's present vs missing. CLI `agent-ready check .` wraps the same logic for humans and CI.

**Tech Stack:** TypeScript, Node 20+, @modelcontextprotocol/sdk, commander, existing check primitives (file-exists, path-glob, dependency-detect)

---

## Phase 1: Skill Content (the knowledge)

The skill IS the product. Write the reference docs first. Each doc teaches one area: why it matters, what to check, what good looks like, what to generate, common mistakes.

### Task 1: Rewrite SKILL.md

**Files:**
- Modify: `skill/agent-ready/SKILL.md`

**Step 1: Replace SKILL.md content**

Replace the entire file. New structure:

```markdown
---
name: agent-ready
description: Best practices for setting up high-quality GitHub repos for AI coding agents. Use when setting up a new repo, improving an existing repo's infrastructure, or answering "what does this repo need for agents to work effectively". Triggers on "set up repo", "make repo agent-ready", "repo best practices", "/agent-ready".
license: MIT
metadata:
  author: agent-next
  version: "2.0.0"
---

# Agent-Ready: Repo Setup Best Practices

A curated collection of best practices for standard high-quality GitHub repos and AI coding agent workflows. Read this to learn what to set up — then use your own intelligence to generate project-specific configs.

## Workflow

1. **Analyze the project** — read package.json/pyproject.toml, understand language/framework/structure
2. **Check what's missing** — call `check_repo_readiness` MCP tool or run `npx agent-ready check .`
3. **Read the relevant reference** — for each missing area, read the reference doc below
4. **Generate project-specific configs** — use your understanding of THIS project, not generic templates
5. **Verify** — run linters, tests, check CI workflows are valid

## The 9 Areas

| Area | Reference | What It Covers |
|------|-----------|---------------|
| Agent Guidance | `references/agent-guidance.md` | AGENTS.md, CLAUDE.md, copilot-instructions, cursor rules |
| Code Quality | `references/code-quality.md` | Linters, formatters, type checkers, .editorconfig |
| Testing | `references/testing/` | BDT methodology, test scaffolds, coverage (6 detailed refs) |
| CI/CD | `references/ci-cd.md` | GitHub Actions: ci.yml, claude.yml, copilot-setup-steps.yml |
| Hooks | `references/hooks.md` | Git pre-commit (Lefthook/Husky) + Claude PostToolUse hooks |
| Branch Rulesets | `references/branch-rulesets.md` | GitHub rulesets via API (require PR, reviews, status checks) |
| Repo Templates | `references/repo-templates.md` | Issue forms, PR template, CODEOWNERS, CONTRIBUTING, SECURITY |
| DevContainer | `references/devcontainer.md` | .devcontainer for reproducible agent environments |
| Security | `references/security.md` | Dependabot, push protection, CodeQL, secret scanning |

## Quick Reference: Files a Repo Should Have

### Agent guidance (all tools)
- `AGENTS.md` — cross-tool standard (Claude, Copilot, Cursor, Gemini)
- `CLAUDE.md` — Claude Code specific (can import AGENTS.md via @AGENTS.md)
- `.github/copilot-instructions.md` — GitHub Copilot
- `.github/workflows/copilot-setup-steps.yml` — Copilot coding agent environment
- `.cursor/rules/*.mdc` — Cursor IDE

### Code quality
- Linter + formatter config (biome.json or ruff in pyproject.toml)
- Type checker config (tsconfig.json strict or mypy)
- `.editorconfig`

### Testing
- Test directory structure (tests/unit/, tests/integration/, tests/e2e/)
- Test runner config
- Coverage config with thresholds

### CI/CD
- `.github/workflows/ci.yml` — lint, typecheck, test, build
- `.github/workflows/claude.yml` — Claude Code Action for PR review

### Hooks
- Pre-commit: lefthook.yml or .husky/
- Claude: `.claude/settings.json` with PostToolUse hooks

### Branch rulesets
- Require PR before merge
- Require reviews + status checks
- Prevent force push and branch deletion

### Repo templates
- `.github/ISSUE_TEMPLATE/*.yml` — YAML forms (not Markdown)
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/CODEOWNERS`
- `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`
- `.gitignore`, `.gitattributes`

### DevContainer
- `.devcontainer/devcontainer.json`

### Security
- `.github/dependabot.yml` — grouped updates
- Push protection enabled
- CodeQL default setup enabled
```

**Step 2: Verify skill loads**

No automated test — this is a Markdown file. Verify manually that it reads correctly.

**Step 3: Commit**

```bash
git add skill/agent-ready/SKILL.md
git commit -m "feat(skill): rewrite SKILL.md as best practices collection

Replace 10-pillar/5-level scoring framework with 9-area best practices
workflow. Agent-ready is now a knowledge layer that teaches agents
what a well-set-up repo looks like, not a scanner that scores repos."
```

---

### Task 2: Write agent-guidance.md reference

**Files:**
- Create: `skill/agent-ready/references/agent-guidance.md`

**Step 1: Write the reference**

Content should cover:
- Why: agents lack institutional knowledge. Guidance files are the onboarding doc.
- AGENTS.md: cross-tool standard, 60k+ repos. 6 sections (commands, testing, structure, style, git, boundaries). Keep < 150 lines.
- CLAUDE.md: Claude-specific. Import AGENTS.md via `@AGENTS.md`. Add hooks config. Hierarchical (parent dirs load at launch, child dirs on demand).
- `.github/copilot-instructions.md`: max 2 pages. Coding conventions only.
- `.github/instructions/*.instructions.md`: path-scoped with YAML frontmatter `applyTo` globs.
- `.cursor/rules/*.mdc`: glob-scoped, supports Always/Auto/Agent Requested/Manual modes.
- Best practice: AGENTS.md is single source of truth. Other files reference or subset it.
- Common mistakes: duplicating across formats, putting style rules in guidance (use linter instead), too long (> 300 lines buries signal).
- Concrete example of a good AGENTS.md (based on the one we wrote for agent-ready itself).

**Step 2: Commit**

```bash
git add skill/agent-ready/references/agent-guidance.md
git commit -m "docs(skill): add agent-guidance reference

How to write AGENTS.md, CLAUDE.md, copilot-instructions, cursor rules.
Cross-tool standards and best practices."
```

---

### Task 3: Write code-quality.md reference

**Files:**
- Create: `skill/agent-ready/references/code-quality.md`

**Step 1: Write the reference**

Content:
- Why: deterministic, fast feedback agents can act on immediately. A formatter is cheaper and more reliable than burning tokens on style instructions.
- JS/TS: Biome (replaces ESLint+Prettier, 10-20x faster). ESLint still valid if already configured. TypeScript strict mode.
- Python: Ruff (replaces black+isort+flake8, written in Rust). mypy for types. uv for package management.
- .editorconfig: editor-agnostic formatting basics (indent style, line endings, trailing whitespace).
- Detection: check for existing tools before installing new ones. Don't add Biome if ESLint is configured.
- Common mistakes: putting style rules in CLAUDE.md (use formatter), enabling strict type checking on legacy codebase all at once (gradual migration).
- Concrete config examples for biome.json, pyproject.toml [tool.ruff], tsconfig.json strict.

**Step 2: Commit**

```bash
git add skill/agent-ready/references/code-quality.md
git commit -m "docs(skill): add code-quality reference

Biome vs ESLint, Ruff vs black, type checking, .editorconfig.
Modern tooling best practices per language."
```

---

### Task 4: Write ci-cd.md reference

**Files:**
- Create: `skill/agent-ready/references/ci-cd.md`

**Step 1: Write the reference**

Content:
- Why: CI is the safety net. Agents produce code fast but have no inherent quality gate.
- ci.yml: must match actual project build commands. Include lint, typecheck, test, build. Node/Python matrix. Concurrency control.
- claude.yml: `anthropics/claude-code-action@v1`. Triggers on issue_comment + pull_request. Cap max_turns and output tokens.
- copilot-setup-steps.yml: job MUST be named `copilot-setup-steps`. Trigger: `workflow_dispatch` only (NOT push/PR). Install deps + build.
- Best practices: agent changes face same or stricter gates as human changes. Track review turnaround, coverage delta, defect escape rate.
- Common mistakes: generic `npm test` when project uses vitest. Running copilot-setup-steps on every push. Not setting concurrency groups.
- Concrete workflow examples for JS/TS and Python.

**Step 2: Commit**

```bash
git add skill/agent-ready/references/ci-cd.md
git commit -m "docs(skill): add ci-cd reference

GitHub Actions best practices: ci.yml, claude.yml, copilot-setup-steps.yml.
Language-aware workflows with concrete examples."
```

---

### Task 5: Write hooks.md reference

**Files:**
- Create: `skill/agent-ready/references/hooks.md`

**Step 1: Write the reference**

Content:
- Why: last local gate before code enters version control. Faster feedback than CI.
- Two layers: git hooks (gate commits) + Claude hooks (gate every edit). Both needed.
- Git hooks: Lefthook (parallel, 2x faster, works without Node) vs Husky (largest community, JS ecosystem standard) vs pre-commit (Python ecosystem).
- Claude hooks: `.claude/settings.json` PostToolUse on `Edit|Write` → run tests. PostToolUse on `Write` → run linter.
- Best practices: don't put slow checks in pre-commit (type check entire codebase). Run changed files only.
- Concrete examples: lefthook.yml, .claude/settings.json with hooks.

**Step 2: Commit**

```bash
git add skill/agent-ready/references/hooks.md
git commit -m "docs(skill): add hooks reference

Git pre-commit (Lefthook/Husky) + Claude Code PostToolUse hooks.
Two-layer quality gate best practices."
```

---

### Task 6: Write branch-rulesets.md reference

**Files:**
- Create: `skill/agent-ready/references/branch-rulesets.md`

**Step 1: Write the reference**

Content:
- Why: agents can produce large volumes of code quickly. Without protection, a misconfigured agent pushes broken code to main. Agents propose, humans approve.
- Rulesets (not legacy branch protection): multiple can stack, org-level scope, evaluate mode for dry-run.
- Essential rules: require PR (agents never push to main), require 1+ human review, dismiss stale approvals, require status checks, prevent deletion, prevent force push.
- API: `gh api repos/{owner}/{repo}/rulesets --method POST --input -` with full JSON payload example.
- Known gotcha: `gh api -F` doesn't handle booleans correctly. Use `--input -` with JSON.
- Fallback: if no permissions, output the command for manual execution.
- Don't add agent bot to bypass list.

**Step 2: Commit**

```bash
git add skill/agent-ready/references/branch-rulesets.md
git commit -m "docs(skill): add branch-rulesets reference

GitHub rulesets via API. Essential rules for agent-guided development.
Full API payload example."
```

---

### Task 7: Write repo-templates.md reference

**Files:**
- Create: `skill/agent-ready/references/repo-templates.md`

**Step 1: Write the reference**

Content:
- Issue forms (YAML) > Markdown templates. Structured fields are easier for agents to parse. Dropdowns, required fields, validation.
- PR template: checklist format. Summary, related issues, testing, review checklist.
- CODEOWNERS: path-based ownership. Last matching pattern wins (not first).
- CONTRIBUTING.md: development workflow, branch naming, testing expectations, PR process.
- SECURITY.md: vulnerability reporting instructions, supported versions, response timeline.
- LICENSE: MIT default. Include in every project.
- .gitignore: language-appropriate patterns from gitignore.io.
- .gitattributes: `* text=auto`, LF for source files, binary for images.
- config.yml: disable blank issues, link to discussions.
- Concrete examples of bug_report.yml and feature_request.yml.

**Step 2: Commit**

```bash
git add skill/agent-ready/references/repo-templates.md
git commit -m "docs(skill): add repo-templates reference

Issue forms, PR template, CODEOWNERS, CONTRIBUTING, SECURITY.
YAML forms over Markdown templates."
```

---

### Task 8: Write devcontainer.md reference

**Files:**
- Create: `skill/agent-ready/references/devcontainer.md`

**Step 1: Write the reference**

Content:
- Why: reproducible agent environments. Eliminates "works on my machine." Security isolation for autonomous agents.
- devcontainer.json: base image per language, extensions, postCreateCommand.
- Three tiers: DevContainer (VS Code native) → Docker Sandboxes (microVM) → claude-code-devcontainer (pre-built with firewall).
- In properly isolated container, `claude --dangerously-skip-permissions` is safe — container is the security boundary.
- Best practices: include build tools, not personal preferences. Use same image in CI for parity. postCreateCommand for npm install/pip install.
- Concrete examples for Node 20 and Python 3.12 containers.

**Step 2: Commit**

```bash
git add skill/agent-ready/references/devcontainer.md
git commit -m "docs(skill): add devcontainer reference

Container config for reproducible agent environments.
Three isolation tiers, concrete config examples."
```

---

### Task 9: Write security.md reference

**Files:**
- Create: `skill/agent-ready/references/security.md`

**Step 1: Write the reference**

Content:
- Priority order: (1) push protection, (2) Dependabot, (3) CODEOWNERS, (4) CodeQL, (5) SECURITY.md.
- Push protection: free for public repos, on by default. Proactive — blocks secrets before they land.
- Dependabot: `.github/dependabot.yml`. Grouped updates by dependency name. Weekly schedule. Auto-merge for patch versions.
- CodeQL: default setup auto-detects languages. No config file needed.
- SECURITY.md: vulnerability reporting email, supported versions, response timeline.
- How to enable via `gh api`: secret scanning, push protection, CodeQL.
- Common mistakes: not enabling push protection (most common). Dependabot without grouping (PR overload). CODEOWNERS syntax (last match wins).

**Step 2: Commit**

```bash
git add skill/agent-ready/references/security.md
git commit -m "docs(skill): add security reference

Dependabot, push protection, CodeQL, SECURITY.md.
Priority order and API enablement commands."
```

---

### Task 10: Delete old scoring references

**Files:**
- Delete: `skill/agent-ready/references/analysis-patterns.md` (386 lines)
- Delete: `skill/agent-ready/references/levels.md` (217 lines)
- Delete: `skill/agent-ready/references/pillars.md` (406 lines)
- Delete: `skill/agent-ready/references/scoring-rubric.md` (206 lines)

**Step 1: Delete files**

```bash
rm skill/agent-ready/references/analysis-patterns.md
rm skill/agent-ready/references/levels.md
rm skill/agent-ready/references/pillars.md
rm skill/agent-ready/references/scoring-rubric.md
```

**Step 2: Commit**

```bash
git add -u skill/agent-ready/references/
git commit -m "chore(skill): remove old scoring references

Delete analysis-patterns, levels, pillars, scoring-rubric.
Replaced by per-area best practice references."
```

---

### Task 11: Update skill metadata and README

**Files:**
- Modify: `skill/agent-ready/metadata.json`
- Modify: `skill/agent-ready/README.md`

**Step 1: Update metadata.json**

Change version to 2.0.0, update description.

**Step 2: Update README.md**

Reflect new positioning: best practices collection, not scanner.

**Step 3: Commit**

```bash
git add skill/agent-ready/metadata.json skill/agent-ready/README.md
git commit -m "chore(skill): update metadata and README for v2

Version 2.0.0. Best practices collection positioning."
```

---

## Phase 2: MCP Check Tool (verification)

### Task 12: Add language detection to ScanContext

**Files:**
- Modify: `src/engine/context.ts`
- Modify: `src/types.ts`
- Test: `test/engine.test.ts`

**Step 1: Write failing test**

```typescript
test('detectLanguage returns typescript for tsconfig project', async () => {
  const ctx = await buildScanContext(fixturePath('standard-repo'));
  assert.strictEqual(ctx.language, 'typescript');
});

test('detectLanguage returns python for pyproject.toml project', async () => {
  const ctx = await buildScanContext(fixturePath('python-repo'));
  assert.strictEqual(ctx.language, 'python');
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- --grep "detectLanguage"
```

**Step 3: Add `language` field to ScanContext in types.ts**

```typescript
language: 'typescript' | 'javascript' | 'python' | 'unknown';
```

**Step 4: Implement detection in context.ts**

Detect via: `tsconfig.json` → typescript, `pyproject.toml`/`setup.py` → python, `package.json` → javascript, else unknown.

**Step 5: Run test to verify it passes**

```bash
npm test -- --grep "detectLanguage"
```

**Step 6: Commit**

```bash
git add src/engine/context.ts src/types.ts test/engine.test.ts
git commit -m "feat: add language detection to ScanContext

Detect typescript/javascript/python/unknown from project files.
Used by check tool to report language-specific missing items."
```

---

### Task 13: Build check_repo_readiness logic

**Files:**
- Create: `src/checker.ts`
- Test: `test/checker.test.ts`

**Step 1: Write failing test**

```typescript
test('checker returns structured readiness for standard-repo', async () => {
  const result = await checkRepoReadiness(fixturePath('standard-repo'));
  assert.strictEqual(result.ok, true);
  assert.strictEqual(typeof result.data.project_type, 'string');
  assert.strictEqual(typeof result.data.language, 'string');
  assert.ok(result.data.areas.agent_guidance);
  assert.ok(['complete', 'partial', 'missing'].includes(result.data.areas.agent_guidance.status));
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- --grep "checker"
```

**Step 3: Implement checker.ts**

Uses `buildScanContext` + existing check primitives (file-exists, path-glob, dependency-detect) to scan 9 areas. Returns structured JSON with `present[]` and `missing[]` per area.

Each area checks for specific files:
- agent_guidance: AGENTS.md, CLAUDE.md, .github/copilot-instructions.md, copilot-setup-steps.yml
- code_quality: eslint/biome config, prettier config, tsconfig strict, .editorconfig
- testing: test dir, test config, coverage config
- ci_cd: .github/workflows/ci.yml, claude.yml, copilot-setup-steps.yml
- hooks: .husky/ or lefthook.yml, .claude/settings.json
- branch_rulesets: status "unknown" (requires gh CLI)
- templates: .github/ISSUE_TEMPLATE/*.yml, PULL_REQUEST_TEMPLATE, CODEOWNERS
- devcontainer: .devcontainer/devcontainer.json
- security: dependabot.yml, SECURITY.md

**Step 4: Run test to verify it passes**

```bash
npm test -- --grep "checker"
```

**Step 5: Add more tests for edge cases**

- empty-repo fixture (all missing)
- python-repo fixture (python-specific checks)
- monorepo fixture

**Step 6: Commit**

```bash
git add src/checker.ts test/checker.test.ts
git commit -m "feat: add check_repo_readiness logic

Scan 9 areas and return structured JSON of present/missing items.
Reuses existing check primitives for file detection."
```

---

### Task 14: Wire up CLI check command

**Files:**
- Create: `src/commands/check.ts`
- Modify: `src/index.ts`

**Step 1: Create check command**

```typescript
import { checkRepoReadiness } from '../checker.js';

export async function checkCommand(path: string, options: { json?: boolean }) {
  const result = await checkRepoReadiness(path);
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    // Human-readable summary
    for (const [area, info] of Object.entries(result.data.areas)) {
      const icon = info.status === 'complete' ? '✓' : info.status === 'partial' ? '△' : '✗';
      console.log(`  ${icon} ${area}: ${info.status}`);
      if (info.missing?.length) {
        for (const m of info.missing) console.log(`      missing: ${m}`);
      }
    }
  }
  // Exit code 1 if anything missing (for CI)
  const allComplete = Object.values(result.data.areas).every(a => a.status === 'complete');
  if (!allComplete && options.strict) process.exit(1);
}
```

**Step 2: Register in index.ts**

Add `check` command alongside existing `scan` and `init`.

**Step 3: Test manually**

```bash
npm run dev -- check .
npm run dev -- check . --json
```

**Step 4: Commit**

```bash
git add src/commands/check.ts src/index.ts
git commit -m "feat: add CLI check command

agent-ready check . — human-readable summary
agent-ready check . --json — structured JSON for agents
agent-ready check . --json --strict — exit 1 if anything missing"
```

---

### Task 15: Rebuild MCP server with check_repo_readiness tool

**Files:**
- Modify: `packages/mcp/src/index.ts`
- Create: `packages/mcp/src/tools/check-readiness.ts`
- Delete: `packages/mcp/src/tools/get-analysis-framework.ts`
- Delete: `packages/mcp/src/tools/get-baseline-scan.ts`

**Step 1: Create check-readiness.ts**

Wraps `checkRepoReadiness()` from main package as MCP tool.

**Step 2: Update MCP index.ts**

Keep `get_repo_context` (still useful). Replace `get_analysis_framework` and `get_baseline_scan` with `check_repo_readiness`. Keep `init_files` for now.

**Step 3: Commit**

```bash
git add packages/mcp/
git commit -m "feat(mcp): rebuild server with check_repo_readiness tool

Replace get_analysis_framework and get_baseline_scan with
check_repo_readiness. Returns structured JSON of 9 areas."
```

---

## Phase 3: Cleanup + Distribution

### Task 16: Delete old scanner, profiles, level-gate

**Files:**
- Delete: `src/scanner.ts`
- Delete: `src/commands/scan.ts`
- Delete: `src/engine/level-gate.ts`
- Delete: `src/output/markdown.ts`
- Delete: `src/profiles/index.ts`
- Delete: `profiles/factory_compat.yaml` (2393 lines)
- Modify: `src/index.ts` (remove scan command registration)
- Modify: `src/lib.ts` (remove scan exports)
- Modify: `src/types.ts` (remove Level, Pillar, score types)

**Step 1: Delete files**

```bash
rm src/scanner.ts src/commands/scan.ts src/engine/level-gate.ts
rm src/output/markdown.ts src/profiles/index.ts
rm profiles/factory_compat.yaml
```

**Step 2: Remove scan from index.ts and lib.ts**

**Step 3: Clean up types.ts — remove Level, Pillar, ScanResult score fields**

**Step 4: Fix any import errors**

```bash
npm run typecheck
```

**Step 5: Update tests — remove scanner tests, keep check tests**

```bash
npm test
```

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove scanner, profiles, level-gate, scoring

Breaking change: scan command removed. Use check command instead.
Profiles and L1-L5 scoring framework deleted (2393 lines).
agent-ready is now a best practices collection, not a scorer."
```

---

### Task 17: Refactor action.yml for check mode

**Files:**
- Modify: `action.yml`

**Step 1: Update action inputs**

Replace `fail-below-level` with `fail-on-missing`. Replace `profile` with nothing. Keep `path` and `comment-on-pr`.

**Step 2: Update action logic**

Run `agent-ready check <path> --json` instead of `agent-ready scan`.

**Step 3: Commit**

```bash
git add action.yml
git commit -m "feat(action): refactor for check mode

Replace scan with check. Remove profile and fail-below-level inputs.
Add fail-on-missing input."
```

---

### Task 18: Rewrite README.md

**Files:**
- Modify: `README.md`

**Step 1: Rewrite**

New positioning: best practices collection for high-quality GitHub repos + coding agent workflows. Not a scanner. Not a scorer. A curated knowledge base that agents read and follow, plus a lightweight check tool for verification.

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README for v2

Best practices collection positioning. Skill as product,
check tool for verification, GitHub Action for CI gate."
```

---

### Task 19: Bump version and publish

**Files:**
- Modify: `package.json` (version → 2.0.0)
- Modify: `CHANGELOG.md`

**Step 1: Update package.json version**

**Step 2: Add CHANGELOG entry for v2.0.0**

Breaking changes: scan command removed, profiles removed, scoring removed. New: check command, 8 best practice reference docs, MCP check_repo_readiness tool.

**Step 3: Full test suite**

```bash
npm run check && npm test
```

**Step 4: Commit and tag**

```bash
git add package.json CHANGELOG.md
git commit -m "chore: bump version to 2.0.0"
git tag v2.0.0
```

---

## Summary

| Phase | Tasks | Commits | What |
|-------|-------|---------|------|
| 1: Skill | 1-11 | 11 | Rewrite SKILL.md + 7 new reference docs + delete old refs |
| 2: Check | 12-15 | 4 | Language detection, checker logic, CLI command, MCP tool |
| 3: Cleanup | 16-19 | 4 | Delete scanner/profiles, refactor Action, README, publish |
| **Total** | **19** | **19** | |
