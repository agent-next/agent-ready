---
name: quick-scan
description: Fast repo readiness check using CLI
allowed-tools:
  - Bash(npx:*)
---

# /quick-scan - Fast Readiness Check

Run the agent-ready CLI for a quick readiness check across 9 areas. Use this when you need a fast baseline without deep analysis.

## When to Use

- **Quick overview** - Get a fast summary of what's present/missing
- **CI/CD integration** - For automated pipelines
- **Before deep analysis** - As a starting point

For comprehensive quality assessment, use `/agent-ready` instead.

## Execution

```bash
npx agent-ready check . --json
```

## Output

The CLI produces structured JSON showing 9 areas with present/missing items.

## Options

```bash
# Human-readable output
npx agent-ready check .

# JSON output for scripts
npx agent-ready check . --json

# Strict mode (exit 1 if anything missing)
npx agent-ready check . --json --strict
```
