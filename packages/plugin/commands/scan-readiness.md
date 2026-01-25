---
name: scan-readiness
description: Quick readiness scan with JSON output
allowed-tools:
  - Bash(npx:*)
---

# /scan-readiness - Quick Agent Readiness Check

A lightweight scan that outputs only JSON for quick assessment.

## Execution

```bash
npx agent-ready scan . --output json
```

## Output Interpretation

The JSON output includes:
- `level`: Current maturity level (L1-L5 or null)
- `overall_score`: Percentage score (0-100)
- `pillars`: Per-pillar breakdown with scores
- `action_items`: Prioritized list of improvements

## Quick Summary

After running, provide a one-line summary:
- Current level and score
- Number of pillars passing/failing
- Most critical action item

Example: "L2 (68%) - 6/9 pillars passing. Critical: Add AGENTS.md for AI agent instructions."
