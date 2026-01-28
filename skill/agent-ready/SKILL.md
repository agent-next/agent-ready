---
name: agent-ready
description: Analyze repositories for AI agent readiness using the 10-pillar / 5-level framework. Use when (1) evaluating codebase quality for AI agents, (2) understanding agent-native configuration, (3) generating missing config files, or (4) answering "how ready is this repo for AI agents". Triggers on "check agent readiness", "analyze repo maturity", "evaluate agent readiness", "what level is this repo", "/agent-ready".
license: MIT
metadata:
  author: robotlearning123
  version: "0.0.2"
---

# Agent-Ready Analysis

Evaluate repository maturity for AI agent collaboration using the 10 Pillars / 5 Levels model.

## What Makes This Different

**Traditional scanners**: Check if files exist (README.md ✓)
**Agent-Ready v0.0.2**: Assess quality and AI-friendliness (README clear? AGENTS.md actionable? MCP configured?)

**Key differentiator**: The `agent_config` pillar - we evaluate Agent Native configurations that no other tool checks:
- `.claude/` directory (settings, commands, hooks)
- `.cursorrules` / `.cursor/rules`
- `mcp.json` and MCP server implementations
- Multi-agent collaboration configs
- Autonomous workflow definitions

## Analysis Framework

### 10 Pillars (v0.0.2)

| # | Pillar | Focus |
|---|--------|-------|
| 1 | docs | README, AGENTS.md, API docs |
| 2 | style | Linting, formatting, types |
| 3 | build | Build scripts, CI/CD |
| 4 | test | Unit, integration, coverage |
| 5 | security | Secrets, dependabot, SAST |
| 6 | observability | Logging, tracing, metrics |
| 7 | env | .env.example, devcontainer |
| 8 | task_discovery | Issue/PR templates |
| 9 | product | Feature flags, analytics |
| 10 | **agent_config** | **Agent Native configs** |

### 5 Levels

| Level | Name | Score Range | Description |
|-------|------|-------------|-------------|
| L1 | Functional | 0-20 | Basic functionality works |
| L2 | Documented | 21-40 | Essential documentation |
| L3 | Standardized | 41-60 | Standard practices |
| L4 | Optimized | 61-80 | Advanced automation |
| L5 | Autonomous | 81-100 | Self-improving, AI-ready |

## How to Analyze

### Step 1: Quick Baseline (Optional)

For fast file-existence checks, run the CLI:

```bash
npx agent-ready scan . --output json
```

This gives you a quick snapshot but **only checks file existence, not quality**.

### Step 2: Deep Analysis

Use Read/Glob/Grep tools to analyze each pillar:

1. **Discover project structure**
   ```
   Glob: **/*.{json,yml,yaml,md,ts,js}
   ```

2. **Read key files**
   - README.md - Project overview
   - package.json - Scripts, dependencies
   - AGENTS.md - Agent instructions
   - .claude/ - Claude Code config

3. **Evaluate quality** using `references/scoring-rubric.md`

4. **Follow patterns** in `references/analysis-patterns.md`

### Step 3: Generate Report

Output format:

```markdown
## Agent Readiness Report

**Level: L3** (Standardized)
**Overall Score: 72/100**

### Pillar Breakdown
| Pillar | Score | Key Finding |
|--------|-------|-------------|
| docs | 85/100 | README clear, missing API docs |
| agent_config | 45/100 | AGENTS.md exists, no MCP |
| test | 65/100 | Good unit tests, no e2e |
...

### Top Recommendations
1. Configure MCP server (+15 agent_config)
2. Add integration tests (+10 test)
3. Add API documentation (+5 docs)
```

## Agent Configuration Analysis (New in v0.0.2)

### What to Look For

**L1 - Basic:**
- AGENTS.md or CLAUDE.md exists
- .gitignore covers .claude/, .cursor/

**L2 - Structured:**
- .claude/settings.json
- .claude/commands/*.md
- .cursorrules
- .aider.conf.yml
- .github/copilot-instructions.md

**L3 - MCP Integration:**
- mcp.json configured
- MCP server implementation
- Claude hooks defined

**L4 - Advanced:**
- Multi-agent collaboration
- Context injection system
- Permission boundaries

**L5 - Autonomous:**
- Autonomous workflows
- Self-improvement mechanisms

### Quality Assessment

For AGENTS.md, check:
- Does it explain key commands?
- Does it describe architecture?
- Does it list code conventions?
- Does it specify files to ignore?
- Is it actionable for AI agents?

For .claude/settings.json, check:
- Are permissions properly restricted?
- Are dangerous commands blocked?
- Are allowed tools specified?

## CLI Reference (For Quick Scans)

```bash
# Basic scan
npx agent-ready scan .

# JSON output
npx agent-ready scan . --output json

# Generate missing files
npx agent-ready init . --level L2

# Preview what would be created
npx agent-ready init . --level L2 --dry-run
```

## References

- **Scoring rubric**: `references/scoring-rubric.md`
- **Analysis patterns**: `references/analysis-patterns.md`
- **Pillar details**: `references/pillars.md`
- **Level requirements**: `references/levels.md`
