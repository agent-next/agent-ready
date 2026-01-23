---
name: agent-ready
description: Scan repositories for AI agent readiness using the Factory.ai 9 Pillars / 5 Levels model. Use this skill when users ask to check repository maturity, agent readiness, evaluate codebase quality for AI agents, or run agent-ready scans. Triggers on phrases like "check agent readiness", "scan for readiness", "evaluate repo maturity", "how ready is this repo for AI agents", or "/agent-ready".
---

# Agent-Ready Scanner

Evaluate repository maturity for AI agent development using the Factory.ai-compatible 9 Pillars / 5 Levels model.

## Quick Start

```bash
# Scan current directory
npx agent-ready scan .

# Scan specific path
npx agent-ready scan /path/to/repo

# JSON output only
npx agent-ready scan . --output json
```

## Understanding Results

### Levels (L1-L5)
| Level | Name | Meaning |
|-------|------|---------|
| L1 | Functional | Code runs, needs manual setup |
| L2 | Documented | Has docs, AGENTS.md, CI basics |
| L3 | Standardized | Integration tests, observability |
| L4 | Optimized | Fast feedback, deployment frequency |
| L5 | Autonomous | Self-improving systems |

### 9 Pillars
1. **docs** - README, AGENTS.md, CONTRIBUTING
2. **style** - Linters, formatters, type checking
3. **build** - Package manifest, CI/CD, lock files
4. **test** - Unit tests, integration tests
5. **security** - .gitignore, dependabot, CODEOWNERS
6. **observability** - Logging, tracing, metrics
7. **env** - .env.example, devcontainer, docker-compose
8. **task_discovery** - Issue templates, PR templates
9. **product** - Feature flags, analytics, A/B testing

## Output Files

After scanning, the tool creates:
- `readiness.json` - Machine-readable results
- Terminal output - Human-readable summary with action items

## Action Items

The scan provides prioritized action items:
- **HIGH** - Blocking issues for current level
- **MEDIUM** - L2 improvements
- **LOW** - L3+ enhancements

## Common Workflow

1. Run scan to assess current state
2. Review failed checks and action items
3. Address HIGH priority items first
4. Re-scan to verify improvements

## Multi-Language Support

Detects patterns for: JavaScript/TypeScript, Python, Go, Rust, Java, Ruby
