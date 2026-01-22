# agent-readiness

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
npm install
npm run build
```

## Usage

### Scan a Repository

```bash
# Scan current directory
npm run dev -- scan

# Scan a specific path
npm run dev -- scan /path/to/repo

# Use a specific profile
npm run dev -- scan --profile factory_compat

# Output only JSON
npm run dev -- scan --output json

# Verbose output with all action items
npm run dev -- scan --verbose

# Check up to a specific level
npm run dev -- scan --level L2
```

### Initialize Missing Files

```bash
# Generate all missing recommended files
npm run dev -- init

# Generate files needed for L2
npm run dev -- init --level L2

# Generate a specific check's template
npm run dev -- init --check docs.agents_md

# Preview what would be created
npm run dev -- init --dry-run
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

### Pillars

| Pillar | Description |
|--------|-------------|
| **Documentation** | README, AGENTS.md, CONTRIBUTING, CHANGELOG |
| **Code Style** | EditorConfig, linter configs, TypeScript |
| **Build System** | Package manifest, scripts, lock files |
| **Testing** | Test files, test framework configuration |
| **Security** | .gitignore, secret patterns, Dependabot |
| **Observability** | Logging frameworks |
| **Environment** | .env.example templates |
| **CI/CD** | GitHub workflows, triggers, actions |
| **Monorepo** | Workspace configuration |

### Levels

| Level | Name | Threshold |
|-------|------|-----------|
| L1 | Minimal | Basic repo setup |
| L2 | Standard | Good development practices |
| L3 | Enhanced | Advanced tooling |
| L4 | Advanced | Enterprise-grade |
| L5 | Optimal | Best-in-class |

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
npm run dev -- scan --profile my_custom_profile
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev -- scan

# Type check
npm run typecheck

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
agent-readiness/
├── src/
│   ├── index.ts              # CLI entry
│   ├── types.ts              # Type definitions
│   ├── scanner.ts            # Main orchestrator
│   ├── checks/               # Check implementations
│   ├── engine/               # Level gating logic
│   ├── profiles/             # Profile loader
│   ├── output/               # JSON/Markdown formatters
│   ├── templates/            # Init command templates
│   └── utils/                # FS, git, YAML utilities
├── profiles/
│   └── factory_compat.yaml   # Default profile
├── templates/                # Template files
└── test/                     # Tests and fixtures
```

## License

MIT
