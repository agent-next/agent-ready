# AGENTS.md - AI Agent Instructions

This file provides instructions for AI agents working with the agent-ready codebase.

## Project Overview

**agent-ready** is a Factory-compatible repository maturity scanner that evaluates codebases against the 9 Pillars / 5 Levels model and outputs actionable readiness reports for AI agents.

## Quick Start

```bash
# Install dependencies
npm install

# Run in development
npm run dev -- scan .

# Run tests
npm test

# Build for production
npm run build

# Type check
npm run typecheck

# Lint and format
npm run lint
npm run format
```

## Codebase Structure

```
src/
├── index.ts              # CLI entry point (Commander.js)
├── scanner.ts            # Main orchestrator for scanning
├── types.ts              # All TypeScript interfaces
├── checks/               # Check implementations
│   ├── index.ts          # Check registry
│   ├── file-exists.ts    # file_exists check
│   ├── path-glob.ts      # path_glob check
│   ├── any-of.ts         # any_of composite check
│   ├── github-workflow.ts
│   ├── github-action.ts
│   ├── build-command.ts
│   ├── log-framework.ts
│   └── dependency-detect.ts
├── engine/
│   ├── index.ts          # Execution engine
│   ├── level-gate.ts     # 80% level gating logic
│   └── context.ts        # Scan context builder
├── output/
│   ├── json.ts           # readiness.json output
│   └── markdown.ts       # Terminal markdown output
├── profiles/
│   └── index.ts          # YAML profile loader
├── commands/
│   └── init.ts           # init command implementation
├── templates/
│   └── index.ts          # Template loading
└── utils/
    ├── fs.ts             # File system utilities
    ├── git.ts            # Git utilities
    └── yaml.ts           # YAML parsing

profiles/
└── factory_compat.yaml   # Default check profile (~34 checks)

templates/                # Template files for init command
test/                     # Test files (*.test.ts)
```

## Key Concepts

### 9 Pillars
- `docs` - Documentation (README, AGENTS.md, CONTRIBUTING)
- `style` - Code Style (linting, formatting, editorconfig)
- `build` - Build System & CI/CD
- `test` - Testing infrastructure
- `security` - Security practices (CODEOWNERS, secrets)
- `observability` - Logging, tracing, metrics
- `env` - Environment setup (dotenv, devcontainer)
- `task_discovery` - Issue/PR templates
- `product` - Feature flags, analytics

### 5 Levels
- L1: Functional (basic working repo)
- L2: Documented (AGENTS.md, contributing guide)
- L3: Standardized (full CI/CD, observability)
- L4: Optimized (advanced tooling)
- L5: Autonomous (self-healing, auto-optimization)

### Level Gating Rule
A level is achieved when:
1. ALL required checks at that level pass
2. >= 80% of ALL checks at that level pass
3. All previous levels are achieved

## Code Conventions

### TypeScript
- Strict mode enabled
- Use interfaces over types where possible
- Export types from `types.ts`
- Avoid `any` - use `unknown` with type guards

### Naming
- Files: `kebab-case.ts`
- Interfaces/Types: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Check IDs: `pillar.check_name` (e.g., `docs.agents_md`)

### Check Implementation Pattern
```typescript
// In src/checks/my-check.ts
export async function executeMyCheck(
  check: MyCheckConfig,
  context: ScanContext
): Promise<CheckResult> {
  // 1. Extract config
  // 2. Execute check logic
  // 3. Return CheckResult with passed/message/suggestions
}
```

### Testing
- Tests use Node.js built-in test runner (`tsx --test`)
- Test files: `test/*.test.ts`
- Fixtures: `test/fixtures/`
- Use `describe()` and `it()` for structure

## Common Tasks

### Adding a New Check Type

1. Add type to `CheckType` union in `types.ts`
2. Add interface extending `BaseCheckConfig` in `types.ts`
3. Add to `CheckConfig` union type
4. Implement executor in `src/checks/new-check.ts`
5. Register in `src/checks/index.ts`
6. Add to profile YAML

### Adding Checks to Profile

Edit `profiles/factory_compat.yaml`:
```yaml
- id: pillar.check_name
  name: Human Readable Name
  type: file_exists
  path: FILENAME.md
  pillar: docs
  level: L2
  required: false
```

### Running Against This Repo

```bash
npm run dev -- scan .
# Output: readiness.json + terminal output
```

## Do's and Don'ts

### Do
- Keep checks simple and focused
- Add suggestions for failed checks
- Use existing utilities from `src/utils/`
- Test with fixtures in `test/fixtures/`
- Follow the 80% gating rule

### Don't
- Add external API calls (keep scanning local/fast)
- Modify `types.ts` without updating all consumers
- Skip the `required` field on checks
- Hardcode paths (use `context.root_path`)

## Dependencies

- `commander` - CLI framework
- `chalk` - Terminal colors
- `glob` - File pattern matching
- `js-yaml` - YAML parsing

Dev dependencies are for TypeScript, testing, and linting.
