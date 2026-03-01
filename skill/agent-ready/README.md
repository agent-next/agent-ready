# agent-ready

Best practices for setting up high-quality GitHub repos for AI coding agents.

## What it does

Teaches AI agents (Claude Code, Copilot, Cursor, Gemini) what a well-set-up repo looks like. The agent reads the skill, analyzes your project, and generates project-specific configs — not templates.

**9 Areas:** Agent Guidance, Code Quality, Testing (BDT), CI/CD, Hooks, Branch Rulesets, Repo Templates, DevContainers, Security

## Installation

```bash
# As a skill (for AI agents)
npx skills add agent-next/agent-ready --path skill/agent-ready

# As a CLI (for humans and CI)
npx agent-ready check .
npx agent-ready check . --json
```

## Links

- [GitHub repository](https://github.com/agent-next/agent-ready)
- [npm package](https://www.npmjs.com/package/agent-ready)
