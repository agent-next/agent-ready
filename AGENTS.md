# AGENTS.md - AI Agent Instructions

Instructions for AI agents working with the agent-ready codebase.

## Project Overview

**agent-ready** is a Factory.ai-compatible repository maturity scanner that evaluates codebases against the 9 Pillars / 5 Levels model.

**Version:** 0.0.1
**Language:** TypeScript
**Runtime:** Node.js >= 20

## Quick Commands

```bash
npm install          # Install dependencies
npm run dev -- scan . # Scan current directory
npm test             # Run tests (22 tests)
npm run typecheck    # Type check
npm run lint         # Lint code
npm run format       # Format code
npm run build        # Build for production
```

## Project Structure

```
agent-readiness/
├── src/
│   ├── index.ts           # CLI entry (Commander.js)
│   ├── scanner.ts         # Main orchestrator
│   ├── types.ts           # TypeScript interfaces
│   ├── checks/            # Check implementations
│   │   ├── index.ts       # Check registry
│   │   ├── file-exists.ts
│   │   ├── path-glob.ts
│   │   ├── any-of.ts
│   │   ├── github-workflow.ts
│   │   ├── github-action.ts
│   │   ├── build-command.ts
│   │   ├── log-framework.ts
│   │   └── dependency-detect.ts
│   ├── engine/
│   │   ├── index.ts       # Execution engine
│   │   ├── level-gate.ts  # Level gating logic
│   │   └── context.ts     # Scan context
│   ├── output/
│   │   ├── json.ts        # JSON output
│   │   └── markdown.ts    # Terminal output
│   ├── profiles/
│   │   └── index.ts       # Profile loader
│   ├── commands/
│   │   └── init.ts        # Init command
│   └── utils/
│       ├── fs.ts
│       ├── git.ts
│       └── yaml.ts
├── profiles/
│   └── factory_compat.yaml # Default profile (35+ checks)
├── templates/              # Init command templates
├── skill/                  # Claude Code skill
│   └── agent-ready/
│       └── SKILL.md
├── docs/
│   └── index.html         # Landing page
├── test/
│   ├── *.test.ts
│   ├── fixtures/
│   └── VALIDATION_REPORT.md
└── agent-ready.skill      # Packaged skill
```

## Key Concepts

### 9 Pillars (Factory.ai Compatible)
| ID | Pillar | Checks |
|----|--------|--------|
| `docs` | Documentation | README, AGENTS.md, CONTRIBUTING, CHANGELOG |
| `style` | Style & Validation | EditorConfig, linters, formatters |
| `build` | Build System | Package manifest, CI/CD, lock files |
| `test` | Testing | Test files, config, integration tests |
| `security` | Security | .gitignore, CODEOWNERS, dependabot |
| `observability` | Observability | Logging, tracing, metrics |
| `env` | Environment | .env.example, devcontainer |
| `task_discovery` | Task Discovery | Issue/PR templates |
| `product` | Product | Feature flags, analytics |

### 5 Levels
| Level | Name | Threshold |
|-------|------|-----------|
| L1 | Functional | 60% of L1 checks |
| L2 | Documented | 60% of L2 checks |
| L3 | Standardized | 60% of L3 checks |
| L4 | Optimized | 60% of L4 checks |
| L5 | Autonomous | 60% of L5 checks |

### Gating Rule
Level N achieved when:
1. ALL required checks at level N pass
2. ≥60% of ALL checks at level N pass
3. All previous levels achieved

## Code Conventions

### TypeScript
- Strict mode enabled
- Use interfaces over types
- Export types from `types.ts`
- Avoid `any` - use `unknown`

### Naming
- Files: `kebab-case.ts`
- Interfaces: `PascalCase`
- Functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Check IDs: `pillar.check_name`

### Check Implementation
```typescript
export async function executeMyCheck(
  check: MyCheckConfig,
  context: ScanContext
): Promise<CheckResult> {
  return {
    check_id: check.id,
    passed: true,
    message: 'Check passed',
    suggestions: []
  };
}
```

## Common Tasks

### Add New Check Type
1. Add to `CheckType` union in `types.ts`
2. Create interface extending `BaseCheckConfig`
3. Add to `CheckConfig` union
4. Implement in `src/checks/new-check.ts`
5. Register in `src/checks/index.ts`

### Add Check to Profile
```yaml
# profiles/factory_compat.yaml
- id: pillar.check_name
  name: Human Readable Name
  type: file_exists
  path: FILENAME.md
  pillar: docs
  level: L2
  required: false
```

### Run Tests
```bash
npm test                    # All tests
npm test -- --grep "file"  # Filter tests
```

### Scan Repository
```bash
npm run dev -- scan .                    # Current dir
npm run dev -- scan /path/to/repo        # Specific path
npm run dev -- scan . --output json      # JSON only
npm run dev -- scan . --verbose          # Full output
```

## Files to Know

| File | Purpose |
|------|---------|
| `src/types.ts` | All TypeScript interfaces |
| `src/checks/index.ts` | Check registry |
| `src/engine/level-gate.ts` | 60% gating logic |
| `profiles/factory_compat.yaml` | Default profile |
| `test/VALIDATION_REPORT.md` | Factory.ai comparison |

## Dependencies

**Runtime:** commander, chalk, glob, js-yaml
**Dev:** typescript, tsx, eslint, prettier

## Do's and Don'ts

### Do
- Keep checks simple and focused
- Add suggestions for failed checks
- Use `context.root_path` for paths
- Test with fixtures

### Don't
- Add external API calls (keep scanning local)
- Modify types.ts without updating consumers
- Hardcode absolute paths
- Skip the `required` field
