# Scoring Rubric

This document defines how to score each pillar from 0-100 based on quality, not just file existence.

## Scoring Philosophy

**v0.0.1 approach (file existence):**
```
if (README.md exists) → pass ✓
```

**v0.0.2 approach (quality assessment):**
```
README.md exists?
  - Clear project description? (+25)
  - Installation instructions? (+25)
  - Usage examples? (+25)
  - Matches actual code? (+25)
```

## Pillar Scoring Tables

### 1. Documentation (docs)

| Score | Criteria |
|-------|----------|
| 0-20  | No README or empty file |
| 21-40 | README exists with only project name |
| 41-60 | Has installation and basic usage |
| 61-80 | Has API docs, examples, troubleshooting |
| 81-100| Complete, accurate, with diagrams |

**Key quality indicators:**
- Does README match package.json name/description?
- Are installation steps actually runnable?
- Do code examples work if copied?
- Is AGENTS.md actionable for AI agents?

### 2. Style & Validation (style)

| Score | Criteria |
|-------|----------|
| 0-20  | No linting/formatting config |
| 21-40 | Config exists but not enforced |
| 41-60 | Linting in CI, some type safety |
| 61-80 | Strict types, pre-commit hooks |
| 81-100| Zero lint errors, 100% type coverage |

**Key quality indicators:**
- Do lint rules match code patterns?
- Is TypeScript set to strict mode?
- Are pre-commit hooks actually working?

### 3. Build System (build)

| Score | Criteria |
|-------|----------|
| 0-20  | No build script or broken build |
| 21-40 | Build exists but not automated |
| 41-60 | CI runs on push/PR |
| 61-80 | Caching, parallelization, artifacts |
| 81-100| Canary deploys, auto-rollback |

**Key quality indicators:**
- Does `npm run build` actually succeed?
- Are CI workflows correctly configured?
- Is there dependency caching?

### 4. Testing (test)

| Score | Criteria |
|-------|----------|
| 0-20  | No tests or only placeholder |
| 21-40 | Some unit tests, low coverage |
| 41-60 | Good unit tests, >50% coverage |
| 61-80 | Unit + integration, >80% coverage |
| 81-100| Mutation testing, property tests |

**Key quality indicators:**
- Do tests actually run and pass?
- What's the code coverage percentage?
- Are edge cases tested?
- Are there integration/e2e tests?

### 5. Security (security)

| Score | Criteria |
|-------|----------|
| 0-20  | No .gitignore or exposes secrets |
| 21-40 | Basic .gitignore exists |
| 41-60 | Secrets ignored, dependabot enabled |
| 61-80 | CODEOWNERS, secret scanning |
| 81-100| SAST in CI, SBOM generation |

**Key quality indicators:**
- Does .gitignore include .env, credentials?
- Is dependabot configured for all ecosystems?
- Are there any exposed secrets in history?

### 6. Observability (observability)

| Score | Criteria |
|-------|----------|
| 0-20  | console.log only |
| 21-40 | Basic logging framework |
| 41-60 | Structured JSON logging |
| 61-80 | Distributed tracing, metrics |
| 81-100| Full APM, dashboards, alerts |

**Key quality indicators:**
- Is logging structured (JSON)?
- Are log levels used appropriately?
- Is there request tracing?

### 7. Development Environment (env)

| Score | Criteria |
|-------|----------|
| 0-20  | No setup documentation |
| 21-40 | .env.example exists |
| 41-60 | docker-compose for local dev |
| 61-80 | Devcontainer configured |
| 81-100| One-command setup, codespaces ready |

**Key quality indicators:**
- Can a new dev get started in <10 minutes?
- Are all env vars documented?
- Does docker-compose actually work?

### 8. Task Discovery (task_discovery)

| Score | Criteria |
|-------|----------|
| 0-20  | No issue/PR templates |
| 21-40 | Basic templates exist |
| 41-60 | Structured templates with fields |
| 61-80 | Labels, milestones, project boards |
| 81-100| Automated triage, bots configured |

**Key quality indicators:**
- Do templates have required fields?
- Are issues labeled consistently?
- Is there a clear contribution path?

### 9. Product & Experimentation (product)

| Score | Criteria |
|-------|----------|
| 0-20  | No feature flags or analytics |
| 21-40 | Basic analytics SDK |
| 41-60 | Feature flags implemented |
| 61-80 | A/B testing infrastructure |
| 81-100| Full experimentation platform |

**Key quality indicators:**
- Are feature flags used for rollouts?
- Is analytics tracking user journeys?
- Can experiments be run safely?

### 10. Agent Configuration (agent_config) - NEW in v0.0.2

| Score | Criteria |
|-------|----------|
| 0-20  | No agent instruction files |
| 21-40 | Basic AGENTS.md exists |
| 41-60 | Structured configs (.cursorrules, etc.) |
| 61-80 | MCP integration, hooks configured |
| 81-100| Autonomous workflows, multi-agent |

**Key quality indicators:**
- Is AGENTS.md actionable for AI agents?
- Are tool permissions properly configured?
- Is there MCP server integration?
- Can agents work autonomously?

## Overall Score Calculation

```
overall_score = sum(pillar_scores) / 10

achieved_level =
  - L1 if overall >= 20 and all pillars >= 16 (80% of 20)
  - L2 if overall >= 40 and all pillars >= 32 (80% of 40)
  - L3 if overall >= 60 and all pillars >= 48 (80% of 60)
  - L4 if overall >= 80 and all pillars >= 64 (80% of 80)
  - L5 if overall >= 90 and all pillars >= 80 (80% of 100)
```

## Assessment Methodology

When evaluating a repository:

1. **Read actual files** - Don't just check existence
2. **Verify functionality** - Does the build work? Do tests pass?
3. **Check consistency** - Does documentation match code?
4. **Consider context** - Libraries vs applications have different needs
5. **Identify blockers** - What's preventing the next level?

Use Read/Glob/Grep tools to gather evidence, then apply the rubric above.
