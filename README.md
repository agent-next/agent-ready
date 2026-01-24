# agent-ready

[中文文档](./README_CN.md) | English

[![npm version](https://img.shields.io/npm/v/agent-ready.svg)](https://www.npmjs.com/package/agent-ready)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

Factory-compatible repo maturity scanner CLI tool that evaluates repositories against the **9 Pillars / 5 Levels** model and outputs actionable readiness reports for AI agents.

## Features

- **9 Pillars Assessment**: Documentation, Code Style, Build, Testing, Security, Observability, Environment, CI/CD, Monorepo
- **5 Maturity Levels**: L1 (Minimal) → L5 (Optimal)
- **80% Gating Rule**: Levels achieved when ≥80% of checks pass AND all required checks pass
- **Extensible Profiles**: YAML-based check definitions
- **Multiple Outputs**: JSON (machine-readable) + Markdown (terminal display)
- **Init Command**: Generate missing files from templates
- **Monorepo Support**: Detect and scan individual apps

## Installation

```bash
# Use npx (no install required)
npx agent-ready scan .

# Or install globally
npm install -g agent-ready
```

## Online API

Use the hosted API for scanning without installation:

```bash
# Submit a scan
curl -X POST https://agent-ready.org/api/scan \
  -H "Content-Type: application/json" \
  -d '{"repo_url":"https://github.com/owner/repo","language":"en"}'

# Check scan status
curl https://agent-ready.org/api/scan/{scan_id}

# List available profiles
curl https://agent-ready.org/api/profiles
```

### API Features
- **Multi-Agent Parallel Analysis**: 9 agents analyze different pillars concurrently
- **Chinese/English Reports**: Set `"language":"zh"` or `"language":"en"`
- **Fast Scanning**: ~300ms per repository
- **Detailed Reports**: Executive summary, pillar details, improvement roadmap

## Claude Code Integration

Install the skill for Claude Code:

```bash
# Download the skill
curl -O https://github.com/anthropics/agent-ready/releases/download/v0.0.1/agent-ready.skill

# Install in Claude Code
claude install agent-ready.skill
```

Then use `/agent-ready` or ask Claude to "check agent readiness" in any repository.

## Quick Start

```bash
# Scan current directory
agent-ready scan .

# See what files to add for better score
agent-ready init --dry-run

# Generate missing files
agent-ready init --level L2
```

## Usage

### Scan a Repository

```bash
# Scan current directory
agent-ready scan .

# Scan a specific path
agent-ready scan /path/to/repo

# Use a specific profile
agent-ready scan --profile factory_compat

# Output only JSON
agent-ready scan --output json

# Verbose output with all action items
agent-ready scan --verbose

# Check up to a specific level
agent-ready scan --level L2
```

### Initialize Missing Files

```bash
# Generate all missing recommended files
agent-ready init

# Generate files needed for L2
agent-ready init --level L2

# Generate a specific check's template
agent-ready init --check docs.agents_md

# Preview what would be created
agent-ready init --dry-run
```

## Output

### Terminal Output

```
Agent Readiness Report
──────────────────────────────────────────────────
Repository: owner/repo
Commit:     abc123
Profile:    factory_compat v1.0.0

┌─────────────────────────────────────────────────┐
│          Level: L2                              │
│          Score: 74%                             │
└─────────────────────────────────────────────────┘

Pillar Summary
──────────────────────────────────────────────────
  Documentation    L2   100% (5/5)
  Code Style       L2    85% (3/3)
  ...

Action Items
──────────────────────────────────────────────────
  [HIGH] L1 Create README.md
  [MEDIUM] L2 Add build scripts to package.json
  ...
```

### JSON Output (readiness.json)

```json
{
  "repo": "owner/repo",
  "commit": "abc123",
  "profile": "factory_compat",
  "level": "L2",
  "progress_to_next": 0.65,
  "overall_score": 74,
  "pillars": {
    "docs": { "level_achieved": "L2", "score": 100 },
    "build": { "level_achieved": "L2", "score": 85 }
  },
  "failed_checks": [...],
  "action_items": [...]
}
```

## The 9 Pillars / 5 Levels Model

### Pillars (Factory.ai Compatible)

| Pillar | Description |
|--------|-------------|
| **Documentation** | README, AGENTS.md, CONTRIBUTING, CHANGELOG |
| **Style & Validation** | EditorConfig, linters, formatters, type checkers |
| **Build System** | Package manifest, build scripts, lock files, CI/CD |
| **Testing** | Test files, test framework configuration |
| **Security** | .gitignore, secret patterns, CODEOWNERS, Dependabot |
| **Debugging & Observability** | Logging, tracing, metrics frameworks |
| **Development Environment** | .env.example, devcontainer, docker-compose |
| **Task Discovery** | Issue templates, PR templates |
| **Product & Experimentation** | Feature flags, analytics, A/B testing |

### Levels (Factory.ai Compatible)

| Level | Name | Description |
|-------|------|-------------|
| L1 | Functional | Code runs but requires manual setup |
| L2 | Documented | Documentation exists with some automation |
| L3 | Standardized | Production-ready for agents with clear processes |
| L4 | Optimized | Fast feedback loops, comprehensive testing |
| L5 | Autonomous | Self-improving with sophisticated orchestration |

### Level Gating Rule

A level is **achieved** when:
1. **ALL required checks** at that level pass
2. **≥80% of all checks** at that level pass
3. **All previous levels** (L1 to L(N-1)) are already achieved

## Check Types

| Type | Description |
|------|-------------|
| `file_exists` | File presence + optional content regex |
| `path_glob` | Glob pattern with min/max matches |
| `any_of` | Composite OR check (pass if any child passes) |
| `github_workflow_event` | CI triggers on specific events |
| `github_action_present` | Specific GitHub Action used |
| `build_command_detect` | Build/test commands in package.json/Makefile |
| `log_framework_detect` | Logging library detection |

## Creating Custom Profiles

Create a YAML file in the `profiles/` directory:

```yaml
name: my_custom_profile
version: "1.0.0"
description: My custom profile

checks:
  - id: custom.my_check
    name: My Custom Check
    description: Checks for something
    type: file_exists
    pillar: docs
    level: L1
    required: true
    path: MY_FILE.md
```

Then use it:

```bash
agent-ready scan --profile my_custom_profile
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
agent-ready scan

# Type check
npm run typecheck

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
agent-ready/
├── src/                      # CLI source code
│   ├── index.ts              # CLI entry
│   ├── types.ts              # Type definitions
│   ├── checks/               # Check implementations
│   ├── engine/               # Level gating logic
│   ├── profiles/             # Profile loader
│   └── utils/                # FS, git, YAML utilities
├── api/                      # Online API (Multi-Agent)
│   ├── src/
│   │   ├── index.ts          # Fastify server
│   │   ├── agents/           # Multi-agent system
│   │   │   ├── orchestrator.ts
│   │   │   ├── evaluator.ts
│   │   │   ├── reporter.ts
│   │   │   └── pillars/      # 9 pillar agents
│   │   ├── routes/           # API routes
│   │   └── i18n/             # Chinese/English
│   ├── Dockerfile
│   └── docker-compose.yml
├── profiles/
│   └── factory_compat.yaml   # Default profile
├── templates/                # Init command templates
└── test/                     # Tests and fixtures
```

## License

MIT
