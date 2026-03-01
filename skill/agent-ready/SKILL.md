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
| 4 | test | Unit, integration, coverage, **[BDT methodology](#testing-methodology-behavior-driven-testing)** |
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

## Testing Methodology (Behavior-Driven Testing)

The `test` pillar includes a full testing methodology based on **Behavior-Driven Testing (BDT)** — start from user behavior, not code structure. Every user-reachable path must be tested.

### Core Principles

1. **Behavior over Implementation** - Test what users see, not how code works
2. **Exhaustive Coverage** - Every branch, every condition, every edge case
3. **Context Awareness** - Every test must define its preconditions explicitly
4. **Real Environment Validation** - Mocks are tools, not destinations

### Workflow

```
Analysis → Design → Execution → Verify Coverage → Ship (or loop back)
```

- **Analysis**: Requirements definition, code change tracking, state machine analysis, branch mapping
- **Design**: Test case design (equivalence partitioning, boundary analysis), impact analysis, prioritization
- **Execution**: Test data preparation, implementation, execution, coverage verification

### Must-Test Branches (Quick Reference)

| Category | Test Cases | Priority |
|----------|------------|:--------:|
| **Empty values** | null, undefined, "", "   " (whitespace), [], {} | P0 |
| **Boundaries** | min-1, min, min+1, max-1, max, max+1 | P1 |
| **Auth states** | logged in, logged out, loading, session expired | P0 |
| **API responses** | 200+data, 200+empty, 400, 401, 403, 404, 500, timeout, offline | P0 |
| **User chaos** | double-click, rapid navigation, refresh mid-action, back button | P1 |

### Branch Matrix Template

For each code change, create a branch matrix:

```markdown
| ID | Condition | True Behavior | False Behavior | Priority | Status |
|----|-----------|---------------|----------------|:--------:|:------:|
| B01 | condition_a | Do X | Do Y | P0 | ⬜ |
| B02 | condition_b | Proceed | Show error | P0 | ⬜ |
| B03 | boundary | Edge case | - | P1 | ⬜ |

Status: ⬜ Pending | ✅ Passed | ❌ Failed
```

### Common Mistakes

| Mistake | Why It's Bad | Fix |
|---------|--------------|-----|
| Only happy path | Error paths are 50% of code | Test ALL branches |
| Skip empty value tests | Most common production bugs | Test null, undefined, "", whitespace separately |
| Mock everything | Mocks hide real problems | Add integration + E2E tests |
| Ignore loading states | Users interact during load | Test loading behavior |

### Pre-Release Checklist

```markdown
## Branch Matrix
- [ ] All P0 branches tested
- [ ] All P1 branches tested
- [ ] No untested edge cases

## Test Types
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Coverage thresholds met

## Real Environment
- [ ] E2E tests pass on staging
- [ ] Core paths verified in real environment
```

### BDT Detailed References

Load these only when you need detailed guidance for a specific phase:

- **Analysis phase**: `references/testing/analysis-phase.md` — Gherkin specs, state machines, branch mapping
- **Design phase**: `references/testing/design-phase.md` — Equivalence partitioning, boundary analysis, decision tables
- **Execution phase**: `references/testing/execution-phase.md` — Fixtures, factories, test execution strategy
- **Branch matrices**: `references/testing/branch-matrices.md` — Templates for auth, API, input, error branches
- **Test templates**: `references/testing/test-templates.md` — Copy-paste unit, integration, E2E templates
- **Testing principles**: `references/testing/testing-principles.md` — Mock vs real, context matrices, progressive strategy

## References

- **Scoring rubric**: `references/scoring-rubric.md`
- **Analysis patterns**: `references/analysis-patterns.md`
- **Pillar details**: `references/pillars.md`
- **Level requirements**: `references/levels.md`
- **Testing methodology**: `references/testing/` (BDT — 6 reference files)
