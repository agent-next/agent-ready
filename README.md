# agent-ready

[中文文档](./README_CN.md) | English

[![npm version](https://img.shields.io/npm/v/agent-ready.svg)](https://www.npmjs.com/package/agent-ready)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

**The missing production control layer for AI-written software.**

> Without it: even a single coding agent can slowly destroy a large codebase through behavioral drift and uncontrolled patches.
>
> With it: **1000 imperfect agents can work in parallel safely.**

## The Vision

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT-DRIVEN DEVELOPMENT                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  SPEC    │ -> │  TASKS   │ -> │  AGENTS  │ -> │  VERIFY  │  │
│  │  .md     │    │  Queue   │    │  Execute │    │  Gates   │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              FROZEN CONTRACTS (types, schemas)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    CI GATEKEEPING                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Demo

![agent-ready demo](./agent-ready-demo.gif)

## Quick Start

```bash
# Scan any repository
npx agent-ready scan .

# See what's needed for the next level
agent-ready init --dry-run

# Generate missing files
agent-ready init --level L2
```

## The 5 Maturity Levels

| Level | Name | What Agents Can Do |
|-------|------|-------------------|
| **L1** | Agent-Readable | Agents can **understand** the codebase (CLAUDE.md, README) |
| **L2** | Agent-Configurable | Agents have **tool configurations** (.cursorrules, settings) |
| **L3** | Agent-Executable | Agents can **run tasks** (MCP, commands, SPEC.md) |
| **L4** | Agent-Coordinated | **Multiple agents** can work together (contracts, ownership) |
| **L5** | Agent-Autonomous | Agents can **self-improve** (feedback loops, conflict resolution) |

## The 11 Pillars

| Pillar | What It Checks |
|--------|----------------|
| **Documentation** | README, AGENTS.md, SPEC.md, CONTRIBUTING |
| **Code Style** | Linters, formatters, EditorConfig |
| **Build System** | Package manifest, CI/CD, build scripts |
| **Testing** | Test framework, contract tests, coverage |
| **Security** | CODEOWNERS, secrets, Dependabot, SAST |
| **Observability** | Logging, tracing, metrics |
| **Environment** | .env.example, devcontainer |
| **Task Discovery** | Issue templates, TASKS.md |
| **Product** | Feature flags, analytics |
| **Agent Config** | .claude/, MCP, boundaries, ownership |
| **Code Quality** | Coverage, complexity, tech debt tracking |

## Agent Control Surface Checks

Beyond "file exists" checks, agent-ready verifies **production control mechanisms**:

### Agent Boundaries (L3)
```yaml
# What agents CAN and CANNOT modify
.claude/boundaries.json
.agent-boundaries.yml
.github/CODEOWNERS  # with agent assignments
```

### Task Discovery (L3)
```yaml
# How agents find work
TASKS.md
tasks.yaml
.github/ISSUE_TEMPLATE/*agent*.md
```

### Frozen Contracts (L4)
```yaml
# Interfaces that must not change
contracts/**/*.ts
schemas/**/*.json
*.contract.test.ts
```

### Agent Coordination (L5)
```yaml
# Multi-agent collaboration
.agent-ownership.json
AGENTS.md  # with ownership mapping
.github/workflows/*conflict*.yml
```

## Spec-Kit Integration

Agent-ready supports [GitHub's spec-kit](https://github.com/github/spec-kit) methodology:

| Check | File | Level |
|-------|------|-------|
| Project Constitution | `CONSTITUTION.md` | L3 |
| Feature Specifications | `SPEC.md`, `specs/**/spec.md` | L3 |
| Implementation Plans | `PLAN.md`, `specs/**/plan.md` | L4 |
| API Contracts | `openapi.yaml`, `swagger.json` | L4 |
| Task Lists | `TASKS.md`, `specs/**/tasks.md` | L3 |

## Installation

```bash
# Use npx (no install required)
npx agent-ready scan .

# Or install globally
npm install -g agent-ready
```

## GitHub Action

```yaml
name: Agent Ready

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Agent Ready
        # Pin to a tag or SHA for production usage; `main` tracks the latest.
        uses: agent-next/agent-ready@main
        with:
          fail-below-level: 'L2'
          comment-on-pr: 'true'
```

### Action Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `path` | Path to scan | `.` |
| `profile` | Profile to use | `factory_compat` |
| `output-format` | `json`, `markdown`, or `both` | `both` |
| `fail-below-level` | Fail if below level | `none` |
| `comment-on-pr` | Post PR comment | `false` |

### Action Outputs

| Output | Description |
|--------|-------------|
| `level` | Achieved level (`L1`-`L5`) |
| `score` | Overall score (0-100) |
| `project-type` | `cli`, `library`, `webapp`, `web-service`, `monorepo` |
| `passed` | Whether threshold was met |

## Online API

```bash
# Submit a scan
curl -X POST https://agent-ready.org/api/scan \
  -H "Content-Type: application/json" \
  -d '{"repo_url":"https://github.com/owner/repo"}'

# Check status
curl https://agent-ready.org/api/scan/{scan_id}
```

## CLI Usage

```bash
# Scan with verbose output
agent-ready scan . --verbose

# Use specific profile
agent-ready scan --profile factory_compat

# Output JSON only
agent-ready scan --output json

# Initialize missing files
agent-ready init --level L3 --dry-run
```

## Output Example

```
Agent Readiness Report
══════════════════════════════════════════════════
Repository: owner/repo
Profile:    factory_compat v1.0.0

┌─────────────────────────────────────────────────┐
│          Level: L3                              │
│          Score: 78%                             │
│          Type:  webapp                          │
└─────────────────────────────────────────────────┘

Pillar Summary
──────────────────────────────────────────────────
  Documentation       L4   90%  ████████░░
  Agent Config        L3   75%  ███████░░░
  Testing             L3   80%  ████████░░
  ...

Action Items (Next Level)
──────────────────────────────────────────────────
  [L4] Create contract tests for API
  [L4] Add agent ownership mapping
  [L4] Define frozen contracts
```

## The "1000 Idiots" Test

A codebase is truly agent-ready when:

> **1000 imperfect AI agents can work on it in parallel without destroying it.**

This requires:
1. **Clear specifications** (what to build)
2. **Frozen contracts** (what not to break)
3. **Strict CI gates** (catch all mistakes)
4. **Agent boundaries** (who owns what)
5. **Verification loops** (continuous checking)

See [VISION.md](./VISION.md) for the complete philosophy.

## Creating Custom Profiles

```yaml
# profiles/my_profile.yaml
name: my_profile
version: "1.0.0"

checks:
  - id: custom.spec_exists
    name: SPEC.md exists
    type: file_exists
    pillar: docs
    level: L3
    path: SPEC.md

  - id: custom.contract_tests
    name: Contract tests
    type: path_glob
    pillar: test
    level: L4
    pattern: "**/*.contract.test.ts"
    min_matches: 1
```

```bash
agent-ready scan --profile my_profile
```

## Development

```bash
npm install        # Install dependencies
npm run dev        # Run in development
npm test           # Run tests
npm run build      # Build for production
```

## Project Structure

```
agent-ready/
├── src/
│   ├── index.ts          # CLI entry
│   ├── checks/           # Check implementations
│   ├── engine/           # Level gating, project type detection
│   └── utils/            # FS, git, YAML utilities
├── profiles/
│   └── factory_compat.yaml   # Default profile (11 pillars, 5 levels)
├── templates/            # Init command templates
├── examples/workflows/   # GitHub Action examples
├── VISION.md             # Agent-driven development philosophy
└── test/                 # Tests and fixtures
```

## Related Projects

- [agent-ready-website](https://github.com/agent-next/agent-ready-website) - Web UI for scanning repos
- [spec-kit](https://github.com/github/spec-kit) - GitHub's spec-driven development methodology

## License

MIT

---

**Agent-Ready: From entropy generator to scalable production worker.**
