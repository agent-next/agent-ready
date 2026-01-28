# Analysis Patterns

This document describes how to analyze each pillar. Use Read/Glob/Grep tools to gather evidence.

---

## 1. Documentation (docs)

### Files to Read
- `README.md` (or `Readme.md`, `readme.md`)
- `AGENTS.md` or `CLAUDE.md`
- `CONTRIBUTING.md`
- `docs/` directory contents

### Analysis Steps

1. **Read README.md** and evaluate:
   ```
   - Project description: Is it clear what this project does? (0-25)
   - Installation: Can you follow the steps? (0-25)
   - Usage examples: Are they runnable? (0-25)
   - Accuracy: Does it match actual code? (0-25)
   ```

2. **Check AGENTS.md** for AI agent usefulness:
   - Does it explain key commands?
   - Does it describe architecture?
   - Does it list conventions?
   - Does it specify files to ignore?

3. **Compare with package.json**:
   - Does README name match package name?
   - Are scripts documented?
   - Are dependencies explained?

### Quality Questions
- Can a new developer understand the project in 5 minutes?
- Can an AI agent get started with AGENTS.md alone?
- Are the docs up-to-date with the code?

---

## 2. Style & Validation (style)

### Files to Read
- `.eslintrc.*`, `eslint.config.js`
- `.prettierrc`, `.prettierrc.json`
- `tsconfig.json`
- `.pre-commit-config.yaml`
- `pyproject.toml` (for Python: ruff, black, mypy)

### Analysis Steps

1. **Check TypeScript strictness**:
   ```typescript
   // Read tsconfig.json
   // Look for: "strict": true
   // Check: noImplicitAny, strictNullChecks
   ```

2. **Verify linting rules**:
   - Are rules consistent with codebase patterns?
   - Is `eslint --max-warnings 0` used in CI?

3. **Check pre-commit hooks**:
   - Does `.husky/pre-commit` run lint/format?
   - Is it actually enforced?

### Quality Questions
- Would the linter catch common bugs?
- Is formatting consistent across the codebase?
- Are there any type errors (`tsc --noEmit`)?

---

## 3. Build System (build)

### Files to Read
- `package.json` (scripts section)
- `.github/workflows/*.yml`
- `Makefile`
- `Dockerfile`

### Analysis Steps

1. **Check build script exists and works**:
   ```json
   // In package.json
   "scripts": {
     "build": "..."  // Should exist
   }
   ```

2. **Analyze CI workflow**:
   ```yaml
   # In .github/workflows/ci.yml
   on: [push, pull_request]  # Both triggers
   jobs:
     build:
       steps:
         - uses: actions/checkout@v4
         - run: npm ci
         - run: npm run build
         - run: npm test
   ```

3. **Check for caching**:
   - Is `actions/cache` used?
   - Is `actions/setup-node` with cache enabled?

### Quality Questions
- Does `npm run build` succeed?
- Is CI running on every PR?
- Are build artifacts cached?

---

## 4. Testing (test)

### Files to Read
- `test/`, `tests/`, `__tests__/` directories
- `jest.config.*`, `vitest.config.*`
- `package.json` (test script)
- Coverage reports if available

### Analysis Steps

1. **Count test files**:
   ```bash
   Glob: **/*.test.{ts,js}
   Glob: **/*.spec.{ts,js}
   ```

2. **Check test script**:
   ```json
   "scripts": {
     "test": "jest"  // or vitest, mocha, etc.
   }
   ```

3. **Look for coverage config**:
   - Is coverage threshold set?
   - What's the current coverage?

4. **Check for integration tests**:
   - `test/e2e/` or `test/integration/`
   - API endpoint tests

### Quality Questions
- Do tests actually pass (`npm test`)?
- What's the code coverage percentage?
- Are there tests for edge cases?

---

## 5. Security (security)

### Files to Read
- `.gitignore`
- `.github/dependabot.yml`
- `CODEOWNERS`
- `.github/workflows/codeql-analysis.yml`

### Analysis Steps

1. **Check .gitignore completeness**:
   ```
   # Must include:
   .env
   .env.local
   *.pem
   node_modules/
   ```

2. **Verify no secrets in code**:
   ```bash
   Grep: (api_key|api_secret|password|token).*=.*['"]
   ```

3. **Check dependabot config**:
   ```yaml
   updates:
     - package-ecosystem: "npm"
       directory: "/"
       schedule:
         interval: "weekly"
   ```

### Quality Questions
- Are all secret patterns in .gitignore?
- Is dependabot monitoring all ecosystems?
- Are there any exposed secrets in git history?

---

## 6. Observability (observability)

### Files to Read
- `src/**/*.ts` (search for logging)
- `package.json` (for logging frameworks)
- Tracing configuration files

### Analysis Steps

1. **Identify logging framework**:
   ```bash
   Grep: (pino|winston|bunyan|log4js)
   ```

2. **Check logging quality**:
   ```typescript
   // Good: structured logging
   logger.info({ userId, action }, 'User logged in');

   // Bad: console.log only
   console.log('User logged in');
   ```

3. **Look for tracing**:
   ```bash
   Grep: (opentelemetry|dd-trace|sentry)
   ```

### Quality Questions
- Is logging structured (JSON)?
- Are log levels used appropriately?
- Is there distributed tracing?

---

## 7. Development Environment (env)

### Files to Read
- `.env.example`
- `.devcontainer/devcontainer.json`
- `docker-compose.yml`
- `Makefile`

### Analysis Steps

1. **Check .env.example completeness**:
   - Are all required env vars listed?
   - Are there comments explaining each?

2. **Verify docker-compose**:
   - Does it define all dependencies (DB, Redis, etc.)?
   - Can it start with `docker-compose up`?

3. **Evaluate devcontainer**:
   - Is it configured for the right language?
   - Are extensions specified?

### Quality Questions
- Can a new dev get started in <10 minutes?
- Are all dependencies containerized?
- Is there a one-command setup?

---

## 8. Task Discovery (task_discovery)

### Files to Read
- `.github/ISSUE_TEMPLATE/*.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/labels.yml` (if exists)

### Analysis Steps

1. **Check issue templates**:
   - Bug report template with steps to reproduce?
   - Feature request template with use case?

2. **Verify PR template**:
   - Does it ask for description?
   - Does it have a checklist?

3. **Look for automation**:
   - Auto-labeling configured?
   - Stale issue bot?

### Quality Questions
- Do templates guide contributors effectively?
- Is there a clear path from issue to PR?
- Are issues categorized with labels?

---

## 9. Product & Experimentation (product)

### Files to Read
- `package.json` (for feature flag/analytics SDKs)
- Config files for feature flags
- Analytics integration code

### Analysis Steps

1. **Identify feature flag SDK**:
   ```bash
   Grep: (launchdarkly|unleash|flagsmith|growthbook)
   ```

2. **Check analytics integration**:
   ```bash
   Grep: (amplitude|mixpanel|segment|posthog)
   ```

3. **Look for A/B testing**:
   ```bash
   Grep: (experiment|ab_test|variant)
   ```

### Quality Questions
- Can features be toggled without deploy?
- Is user behavior tracked?
- Can experiments be run safely?

---

## 10. Agent Configuration (agent_config)

### Files to Read
- `AGENTS.md` or `CLAUDE.md`
- `.claude/settings.json`
- `.claude/commands/*.md`
- `.cursorrules`
- `mcp.json`
- `.claude/hooks/*`

### Analysis Steps

1. **Check AGENTS.md quality**:
   - Does it explain key commands?
   - Does it describe architecture?
   - Does it list conventions?
   - Does it specify files to ignore?

2. **Verify Claude Code configuration**:
   ```json
   // .claude/settings.json
   {
     "permissions": {
       "allow": ["Bash(*)", "Read(*)", "Write(*)"],
       "deny": ["Bash(rm -rf *)"]
     }
   }
   ```

3. **Check for MCP integration**:
   - Is there an MCP server?
   - Are tools properly defined?

4. **Look for hooks**:
   - PreCommit hooks?
   - PostEdit hooks?
   - Custom automation?

### Quality Questions
- Can an AI agent work effectively with this codebase?
- Are permissions properly restricted?
- Is there multi-agent collaboration support?

---

## Report Generation

After analyzing all pillars, generate a report like:

```markdown
## Agent Readiness Report

**Level: L3** (Standardized)
**Overall Score: 72/100**

### Pillar Scores
| Pillar | Score | Key Issue |
|--------|-------|-----------|
| docs | 85 | Missing API reference |
| test | 65 | No integration tests |
| agent_config | 70 | No MCP integration |
...

### Top 3 Recommendations
1. Add API documentation to README (docs +10)
2. Add integration tests (test +15)
3. Configure MCP server (agent_config +20)
```
