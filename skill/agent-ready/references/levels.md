# The 5 Maturity Levels

Each level represents a stage of repository maturity, with progressively higher requirements across all pillars.

---

## Level 1: Functional (L1)

**Core Idea**: The code works and someone can run it.

### Requirements

| Pillar | Requirements |
|--------|--------------|
| docs | README.md exists |
| style | EditorConfig present |
| build | Build command defined, lock file exists |
| test | Test framework configured, test command works |
| security | .gitignore excludes secrets |

### What It Means
- A developer can clone, build, and run the project
- Basic tests pass
- Secrets are not accidentally committed

### Typical Score: 20-40%

---

## Level 2: Documented (L2)

**Core Idea**: Essential documentation exists for humans and AI agents.

### Requirements

| Pillar | Requirements |
|--------|--------------|
| docs | + AGENTS.md, CONTRIBUTING.md |
| style | + Linting configured |
| build | + CI workflow runs on push/PR |
| test | + Tests run in CI |
| security | + .env.example documents variables |
| env | + Local setup instructions |

### What It Means
- New contributors can onboard
- AI agents have context via AGENTS.md
- Changes are automatically validated

### Typical Score: 40-60%

---

## Level 3: Standardized (L3)

**Core Idea**: Follows industry standards and best practices.

### Requirements

| Pillar | Requirements |
|--------|--------------|
| docs | + API documentation |
| style | + Formatting (Prettier/Black), type checking |
| build | + Multiple CI checks (lint, test, build) |
| test | + Coverage reporting |
| security | + CODEOWNERS file |
| observability | + Structured logging |
| env | + Docker Compose for services |
| task_discovery | + Issue templates, PR template |

### What It Means
- Code follows consistent patterns
- Coverage is tracked
- Issues and PRs are well-structured

### Typical Score: 60-75%

---

## Level 4: Optimized (L4)

**Core Idea**: Advanced tooling and automation for efficiency.

### Requirements

| Pillar | Requirements |
|--------|--------------|
| docs | + Generated docs from code |
| style | + Pre-commit hooks |
| build | + CI caching, parallel jobs |
| test | + Coverage thresholds enforced |
| security | + Dependabot, security scanning |
| observability | + Tracing, metrics |
| env | + Devcontainer config |
| task_discovery | + Labels, milestones |
| product | + Feature flags |

### What It Means
- CI is fast with caching
- Security is proactively managed
- Development environment is reproducible

### Typical Score: 75-90%

---

## Level 5: Autonomous (L5)

**Core Idea**: Self-improving systems ready for full AI collaboration.

### Requirements

| Pillar | Requirements |
|--------|--------------|
| docs | + Documentation freshness checks |
| style | + Auto-fix in CI |
| build | + Progressive deployment |
| test | + Automated test generation/suggestion |
| security | + Secret rotation, compliance auditing |
| observability | + Anomaly detection, SLOs |
| env | + One-click prod-like environment |
| task_discovery | + Automated issue creation from monitoring |
| product | + A/B testing, experiment framework |

### What It Means
- System monitors and improves itself
- AI agents can operate with minimal supervision
- Comprehensive automation end-to-end

### Typical Score: 90-100%

---

## Scoring Rules

### Passing Threshold
- **80%** of checks at a level must pass to achieve that level
- All previous levels must be achieved

### Example Progression
```
Repository State:
- L1: 95% passed ✓ (achieved)
- L2: 82% passed ✓ (achieved)
- L3: 65% passed ✗ (not achieved)
- L4: 20% passed ✗ (blocked by L3)

Result: Level L2, Score: 62%
```

### Priority Calculation
1. **CRITICAL**: Failed required checks at current level
2. **HIGH**: Checks needed to achieve next level
3. **MEDIUM**: Optional improvements at current level
4. **LOW**: Future level improvements

---

## Progression Strategy

### From Nothing to L1
Focus: Make it run
1. Add README.md with setup instructions
2. Configure build command
3. Add basic test suite
4. Create .gitignore

### From L1 to L2
Focus: Document everything
1. Write AGENTS.md (AI agent context)
2. Add CONTRIBUTING.md
3. Set up CI workflow
4. Create .env.example

### From L2 to L3
Focus: Standardize
1. Add linting + formatting
2. Set up coverage reporting
3. Create issue/PR templates
4. Add structured logging

### From L3 to L4
Focus: Optimize
1. Add CI caching
2. Set up Dependabot
3. Create devcontainer
4. Implement feature flags

### From L4 to L5
Focus: Automate
1. Add documentation checks
2. Implement SLO monitoring
3. Set up experiment framework
4. Enable automated issue creation

---

## Chinese Level Names (中文级别名称)

| Level | English | 中文 |
|-------|---------|------|
| L1 | Functional | 可运行 |
| L2 | Documented | 有文档 |
| L3 | Standardized | 标准化 |
| L4 | Optimized | 已优化 |
| L5 | Autonomous | 自治 |
