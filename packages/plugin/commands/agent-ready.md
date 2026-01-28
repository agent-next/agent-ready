---
name: agent-ready
description: Deep AI analysis of repository agent readiness using 10-pillar framework
allowed-tools:
  - Bash(npx:*, git:*)
  - Read(*)
  - Glob(*)
  - Grep(*)
  - Write(*)
---

# /agent-ready - Deep Repository Analysis

Perform comprehensive AI-driven analysis of repository agent readiness. Goes beyond file existence to evaluate quality.

## What This Command Does

Unlike traditional linters that just check file existence, `/agent-ready`:
1. **Reads actual content** - Evaluates README quality, not just presence
2. **Assesses agent-friendliness** - Is AGENTS.md actionable? MCP configured?
3. **Scores quality** - 0-100 per pillar, not just pass/fail
4. **Provides specific recommendations** - With code references

## Analysis Framework

### 10 Pillars (v0.0.2)

| Pillar | What We Check |
|--------|---------------|
| docs | README clarity, AGENTS.md usefulness, API docs |
| style | Linting rules, TypeScript strictness, formatting |
| build | Build scripts, CI workflows, caching |
| test | Test coverage, integration tests, quality |
| security | Secrets in .gitignore, dependabot, SAST |
| observability | Structured logging, tracing, metrics |
| env | .env.example, devcontainer, docker-compose |
| task_discovery | Issue templates, PR templates, labels |
| product | Feature flags, analytics, A/B testing |
| **agent_config** | AGENTS.md, .cursorrules, MCP, hooks |

### 5 Levels

- L1 (0-20): Functional - Code works
- L2 (21-40): Documented - Has essential docs
- L3 (41-60): Standardized - Follows best practices
- L4 (61-80): Optimized - Advanced automation
- L5 (81-100): Autonomous - AI-ready

## Execution Flow

### Step 1: Project Discovery

Glob scan to understand project structure:
- Identify tech stack (package.json, pyproject.toml, go.mod)
- Find key files (README, AGENTS.md, config files)
- Detect monorepo structure

### Step 2: Quick Baseline (Optional)

Run CLI for file existence checks:
```bash
npx agent-ready scan . --output json
```

This provides a quick baseline but **only checks existence, not quality**.

### Step 3: Deep Analysis

For each pillar, read and evaluate actual content:

**Documentation Example:**
1. Read README.md
2. Check: Is project purpose clear? Installation steps runnable? Examples work?
3. Compare with package.json to verify accuracy
4. Score 0-100 based on rubric

**Agent Config Example:**
1. Read AGENTS.md
2. Check: Does it explain commands? List conventions? Specify ignored files?
3. Read .claude/settings.json if exists
4. Check: Are permissions properly configured?
5. Score based on completeness and usefulness

### Step 4: Generate Report

Output comprehensive analysis:

```markdown
## Agent Readiness Report

**Level: L3** (Standardized)
**Overall Score: 72/100**

### Pillar Breakdown
| Pillar | Score | Key Finding |
|--------|-------|-------------|
| docs | 85 | README clear, API docs incomplete |
| agent_config | 55 | AGENTS.md exists, no MCP |
| test | 65 | Good unit tests, no e2e |
| build | 80 | CI configured, needs caching |
| security | 70 | Dependabot enabled, no SAST |

### Top 3 Recommendations
1. **Configure MCP server** (+15 agent_config)
   - Create mcp.json with project tools
   - Add .claude/hooks/ for automation

2. **Add integration tests** (+10 test)
   - Create test/e2e/ directory
   - Test main user flows

3. **Add API documentation** (+5 docs)
   - Document public functions in README
   - Or add TypeDoc/JSDoc config

### Agent Configuration Status
- [x] AGENTS.md exists
- [x] .gitignore covers agent caches
- [ ] .claude/settings.json (missing)
- [ ] .cursorrules (missing)
- [ ] mcp.json (missing)
- [ ] Claude hooks (missing)
```

## Key Files for Agent-Ready Analysis

Priority reading order for agent-friendliness:
1. `AGENTS.md` or `CLAUDE.md` - Agent instructions
2. `package.json` - Scripts, dependencies
3. `README.md` - Project overview
4. `.claude/settings.json` - Claude Code config
5. `.cursorrules` - Cursor AI rules
6. `mcp.json` - MCP server config
7. `.github/workflows/*.yml` - CI setup

## Example Usage

When user runs `/agent-ready`:
1. Run project discovery with Glob
2. Read key files with Read tool
3. Optionally run CLI baseline
4. Evaluate each pillar using analysis patterns
5. Generate comprehensive report
6. Offer to implement recommendations
