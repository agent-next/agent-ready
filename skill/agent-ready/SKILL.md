---
name: agent-ready
description: Best practices for setting up high-quality GitHub repos for AI coding agents. Use when setting up a new repo, improving an existing repo's infrastructure, or answering "what does this repo need for agents to work effectively". Triggers on "set up repo", "make repo agent-ready", "repo best practices", "/agent-ready".
license: MIT
metadata:
  author: agent-next
  version: "0.2.0"
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
