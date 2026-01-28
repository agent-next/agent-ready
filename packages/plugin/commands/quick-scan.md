---
name: quick-scan
description: Fast file-existence scan using CLI (no deep analysis)
allowed-tools:
  - Bash(npx:*)
---

# /quick-scan - Fast Baseline Scan

Run the agent-ready CLI for a quick file-existence check. Use this when you need a fast baseline without deep analysis.

## When to Use

- **Quick overview** - Get a fast summary of file presence
- **CI/CD integration** - For automated pipelines
- **Before deep analysis** - As a starting point

For comprehensive quality assessment, use `/agent-ready` instead.

## Execution

```bash
npx agent-ready scan . --output both
```

## Output

The CLI produces:
1. **Terminal output** - Color-coded summary
2. **readiness.json** - JSON results file

## Limitations

The CLI only checks **file existence**, not quality:

| What CLI checks | What it doesn't check |
|-----------------|----------------------|
| README.md exists | README is clear |
| AGENTS.md exists | AGENTS.md is useful |
| package.json has test script | Tests actually pass |
| .gitignore exists | All secrets are covered |

For quality assessment, use `/agent-ready` which reads file contents.

## Example Output

```
Agent Readiness: L2 (62%)

Pillars:
  docs         ████████░░  80%  L3
  style        ██████░░░░  60%  L2
  build        ████████░░  75%  L3
  test         ██████░░░░  55%  L2
  security     ██████░░░░  60%  L2
  agent_config ████░░░░░░  40%  L2

Top Actions:
1. [CRITICAL] Add AGENTS.md
2. [HIGH] Configure .claude/settings.json
3. [MEDIUM] Add integration tests
```

## Options

```bash
# JSON output only
npx agent-ready scan . --output json

# Verbose mode (show all checks)
npx agent-ready scan . --verbose

# Target specific level
npx agent-ready scan . --level L2

# Chinese output
npx agent-ready scan . --lang zh
```
