# agent-ready

Best practices for setting up high-quality GitHub repos for AI coding agents.

Agent-ready is a **knowledge layer** that teaches AI agents (Claude Code, Copilot, Cursor, Gemini) what a well-set-up repo looks like. The agent reads the skill, analyzes your project, and generates project-specific configs.

## Three Deliverables

| Deliverable | What | For |
|-------------|------|-----|
| **Skill** | 9 best practice reference docs + BDT testing methodology | AI agents |
| **CLI** | `npx agent-ready check .` -- scan what's present/missing | Humans + CI |
| **MCP Server** | `check_repo_readiness` tool -- structured JSON for agents | AI agents |

## The 9 Areas

| Area | What It Covers |
|------|---------------|
| Agent Guidance | AGENTS.md, CLAUDE.md, copilot-instructions, cursor rules |
| Code Quality | Linters (Biome/Ruff), formatters, type checkers, .editorconfig |
| Testing | BDT methodology, test scaffolds, coverage thresholds |
| CI/CD | GitHub Actions: ci.yml, claude.yml, copilot-setup-steps.yml |
| Hooks | Git pre-commit (Lefthook/Husky) + Claude PostToolUse hooks |
| Branch Rulesets | GitHub rulesets via API (require PR, reviews, status checks) |
| Repo Templates | Issue forms (YAML), PR template, CODEOWNERS |
| DevContainer | .devcontainer for reproducible agent environments |
| Security | Dependabot, push protection, CodeQL, secret scanning |

## Quick Start

### For AI Agents (Skill)

The skill teaches agents what to set up. Install it or point your agent at the reference docs:

```bash
# Install as a skill
npx skills add agent-next/agent-ready --path skill/agent-ready
```

### For Humans (CLI)

```bash
# Check what's present/missing
npx agent-ready check .

# JSON output for scripts
npx agent-ready check . --json

# CI gate (exit 1 if anything missing)
npx agent-ready check . --json --strict
```

### GitHub Action

```yaml
- uses: agent-next/agent-ready@v2
  with:
    path: .
    fail-on-missing: true
```

## License

MIT
