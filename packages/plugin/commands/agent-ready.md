---
name: agent-ready
description: Scan current repository for AI agent readiness
allowed-tools:
  - Bash(npx:*)
  - Read(*)
  - Glob(*)
  - Grep(*)
---

# /agent-ready - Repository Agent Readiness Scanner

Scans the current repository against the Factory.ai 9-pillar framework to assess AI agent readiness.

## Framework Overview

The scan evaluates 9 pillars across 5 maturity levels:

### Pillars
1. **Documentation** - README, AGENTS.md, CONTRIBUTING.md
2. **Style & Validation** - Linting, formatting, type checking
3. **Build System** - Build commands, CI/CD workflows
4. **Testing** - Test framework, coverage, test commands
5. **Security** - Secrets management, CODEOWNERS, security scanning
6. **Observability** - Logging, tracing, metrics
7. **Development Environment** - Devcontainer, Docker Compose, .env
8. **Task Discovery** - Issue templates, PR templates, labels
9. **Product** - Feature flags, analytics, A/B testing

### Levels
- **L1 (Functional)** - Basic functionality works
- **L2 (Documented)** - Has essential documentation
- **L3 (Standardized)** - Follows standard practices
- **L4 (Optimized)** - Advanced tooling and automation
- **L5 (Autonomous)** - Self-improving, AI-ready

## Execution

Run the agent-ready scanner:

```bash
npx agent-ready scan . --output both
```

## Output

The scan produces:
1. **Terminal output** - Color-coded summary with pillar scores
2. **readiness.json** - Detailed JSON results for programmatic use

## Key Actions After Scan

After running the scan, I will:
1. Summarize the current level achieved
2. Highlight which pillars need the most work
3. List the top 5 action items to improve readiness
4. Suggest specific files to create or modify

## Example Usage

When user runs `/agent-ready`:
1. Run `npx agent-ready scan . --output both`
2. Parse the results and provide actionable recommendations
3. Offer to help implement the suggested improvements
