---
name: agent-ready
description: Scan repositories for AI agent readiness using the Factory.ai 9-pillar / 5-level framework. Use when (1) checking repository maturity for AI agents, (2) evaluating codebase quality, (3) generating missing config files, or (4) understanding what makes a repo agent-ready. Triggers on "check agent readiness", "scan for readiness", "evaluate repo maturity", "how ready is this repo", "what level is this repo", "/agent-ready".
---

# Agent-Ready Scanner

Evaluate repository maturity for AI agent collaboration using the Factory.ai-compatible 9 Pillars / 5 Levels model.

## Quick Start

```bash
# Scan current directory
npx agent-ready scan .

# Chinese output
npx agent-ready scan . --lang zh

# Generate missing files for L2
npx agent-ready init . --level L2

# Preview what would be created
npx agent-ready init . --level L2 --dry-run
```

## CLI Reference

### scan
```bash
npx agent-ready scan <path> [options]
  -o, --output <format>   json | markdown | both (default: both)
  -l, --level <level>     Target level (L1-L5)
  -v, --verbose           Show all checks
  --lang <locale>         en | zh
```

### init
```bash
npx agent-ready init <path> [options]
  -l, --level <level>     Generate files for level
  -c, --check <id>        Generate for specific check
  -n, --dry-run           Preview only
  -f, --force             Overwrite existing
```

## Understanding Results

**Levels (L1-L5):** L1=Functional, L2=Documented, L3=Standardized, L4=Optimized, L5=Autonomous

**Pillars (9):** docs, style, build, test, security, observability, env, task_discovery, product

**Scoring:** 80% of checks must pass per level. See `references/levels.md` for details.

**Action Priorities:**
- CRITICAL - Blocking current level
- HIGH - Required for next level
- MEDIUM/LOW - Improvements

## Common Workflows

**Initial assessment:**
```bash
npx agent-ready scan . --verbose
```

**Reach L2 (most important for AI agents):**
```bash
npx agent-ready init . --level L2
```

**Fix specific check:**
```bash
npx agent-ready init . --check docs.agents_md
```

## Key File: AGENTS.md

The most important file for AI agent readiness:

```markdown
# AGENTS.md

## Project Context
What this project does.

## Key Commands
- `npm run build` - Build
- `npm test` - Test

## Code Conventions
- TypeScript strict mode
- Functional patterns

## Files to Ignore
- node_modules/, dist/, .env
```

## References

- **Pillar details:** See `references/pillars.md` for each pillar's purpose, key files, and examples
- **Level requirements:** See `references/levels.md` for per-level requirements and progression strategy
