# The 9 Pillars of Agent Readiness

Each pillar represents a dimension of repository maturity that enables AI agents to work effectively with the codebase.

---

## 1. Documentation (docs)

**Purpose**: Provide context and instructions for both humans and AI agents.

### Key Files
| File | Level | Purpose |
|------|-------|---------|
| README.md | L1 | Project overview, installation, usage |
| AGENTS.md | L2 | AI agent-specific instructions |
| CONTRIBUTING.md | L2 | Contribution guidelines |
| API docs | L3 | Generated or written API documentation |

### AGENTS.md Best Practices
```markdown
# AGENTS.md

## Project Context
Brief description of what this project does.

## Key Commands
- `npm run build` - Build the project
- `npm test` - Run tests
- `npm run lint` - Check code style

## Architecture
- `src/` - Source code
- `test/` - Test files
- `docs/` - Documentation

## Code Conventions
- Use TypeScript strict mode
- Prefer functional patterns
- All public APIs need JSDoc

## Files to Ignore
- `node_modules/`
- `dist/`
- `.env` (but see .env.example)
```

---

## 2. Style & Validation (style)

**Purpose**: Ensure consistent code quality that AI agents can understand and maintain.

### Key Configurations
| Tool | Level | Purpose |
|------|-------|---------|
| ESLint/Pylint | L2 | Catch bugs and enforce patterns |
| Prettier/Black | L2 | Consistent formatting |
| TypeScript/mypy | L3 | Type safety |
| EditorConfig | L1 | Cross-editor consistency |

### Why It Matters for Agents
- Consistent formatting = easier to generate matching code
- Type hints = better understanding of data flow
- Linting rules = guardrails for code generation

---

## 3. Build System (build)

**Purpose**: Reliable, reproducible builds that agents can trigger and verify.

### Key Components
| Component | Level | Purpose |
|-----------|-------|---------|
| Build command | L1 | `npm run build`, `make`, etc. |
| CI workflow | L2 | Automated builds on PR/push |
| Lock file | L1 | Reproducible dependencies |
| Caching | L4 | Fast CI builds |

### CI Workflow Example
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm test
```

---

## 4. Testing (test)

**Purpose**: Verify code works correctly, enabling confident changes.

### Key Components
| Component | Level | Purpose |
|-----------|-------|---------|
| Test framework | L1 | Jest, pytest, go test, etc. |
| Test command | L1 | `npm test` documented |
| Coverage | L3 | Track test coverage % |
| Coverage threshold | L4 | Enforce minimum coverage |

### Why It Matters for Agents
- Tests = validation that changes work
- Coverage = confidence in what's tested
- Test patterns = templates for new tests

---

## 5. Security (security)

**Purpose**: Protect sensitive data and enforce access controls.

### Key Components
| Component | Level | Purpose |
|-----------|-------|---------|
| .gitignore | L1 | Exclude secrets and artifacts |
| CODEOWNERS | L3 | Define ownership and review rules |
| Dependabot | L3 | Automated dependency updates |
| Secret scanning | L4 | Detect exposed credentials |

### Critical .gitignore Patterns
```gitignore
# Secrets
.env
.env.local
*.pem
*.key

# Build artifacts
dist/
build/
node_modules/

# IDE
.idea/
.vscode/
*.swp
```

---

## 6. Observability (observability)

**Purpose**: Understand system behavior through logs, traces, and metrics.

### Key Components
| Component | Level | Purpose |
|-----------|-------|---------|
| Structured logging | L3 | JSON logs with context |
| Tracing | L4 | Request flow tracking |
| Metrics | L4 | Performance measurements |
| Error tracking | L3 | Aggregate error monitoring |

### Structured Logging Example
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

logger.info({ userId, action: 'login' }, 'User logged in');
```

---

## 7. Development Environment (env)

**Purpose**: Enable quick, consistent environment setup.

### Key Components
| Component | Level | Purpose |
|-----------|-------|---------|
| .env.example | L2 | Document required env vars |
| devcontainer | L4 | Containerized development |
| docker-compose | L3 | Local service dependencies |
| Makefile | L2 | Common command shortcuts |

### .env.example Format
```bash
# Required
DATABASE_URL=postgres://localhost:5432/myapp
API_KEY=your-api-key-here

# Optional (with defaults)
PORT=3000
LOG_LEVEL=info
```

---

## 8. Task Discovery (task_discovery)

**Purpose**: Enable agents to find and understand work items.

### Key Components
| Component | Level | Purpose |
|-----------|-------|---------|
| Issue templates | L3 | Structured bug/feature reports |
| PR templates | L3 | Consistent PR descriptions |
| Labels | L4 | Issue categorization |
| Milestones | L5 | Release planning |

### Issue Template Example
```markdown
---
name: Bug Report
about: Report a bug
---

## Description
<!-- What happened? -->

## Steps to Reproduce
1.
2.
3.

## Expected Behavior
<!-- What should happen? -->

## Environment
- OS:
- Node version:
```

---

## 9. Product & Experimentation (product)

**Purpose**: Enable data-driven decisions and safe rollouts.

### Key Components
| Component | Level | Purpose |
|-----------|-------|---------|
| Feature flags | L4 | Gradual rollouts |
| Analytics | L4 | Usage tracking |
| A/B testing | L5 | Experiment framework |
| Error budgets | L5 | SLO-based decisions |

### Feature Flag Example
```typescript
import { isEnabled } from './feature-flags';

if (isEnabled('new-checkout-flow', user)) {
  renderNewCheckout();
} else {
  renderLegacyCheckout();
}
```

---

## Pillar Dependencies

Some pillars depend on others:

```
L1: docs → style → build → test → security
L2: + observability → env → task_discovery
L3-5: + product
```

Higher levels build on lower levels. Achieve L2 across all basic pillars before focusing on L3+ optimizations.
