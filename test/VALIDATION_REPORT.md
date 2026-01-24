# Agent-Ready Validation Report

## Factory.ai Compatibility Verification

### Specification Compliance

| Aspect | Factory.ai Spec | agent-ready | Status |
|--------|-----------------|-------------|--------|
| Pillars | 9 pillars | 9 pillars (exact names) | ✅ |
| Levels | 5 levels (L1-L5) | 5 levels | ✅ |
| Level Names | Functional→Autonomous | Exact match | ✅ |
| Gating Rule | 80% threshold | 80% threshold | ✅ |
| Evaluation | Binary pass/fail | Pass/fail | ✅ |
| Monorepo | App-scope checks | Supported | ✅ |

### 9 Pillars Mapping

| Factory.ai Pillar | agent-ready ID | Checks |
|-------------------|----------------|--------|
| Documentation | `docs` | 6 |
| Style & Validation | `style` | 4 |
| Build System | `build` | 7 |
| Testing | `test` | 3 |
| Security | `security` | 4 |
| Debugging & Observability | `observability` | 3 |
| Development Environment | `env` | 3 |
| Task Discovery | `task_discovery` | 2 |
| Product & Experimentation | `product` | 3 |

## Factory.ai Comparison Results

**Test Date:** 2026-01-23
**Passing Threshold:** 80% per level (Factory.ai compatible)

### Level Comparison with Factory.ai (After L3 Fixes)

| Repository | Factory.ai | agent-ready | Level Match | L3 Progress |
|------------|-----------|-------------|-------------|-------------|
| Flask | L2, 37% | L2, 62% | ✅ | 17% |
| FastAPI | L3, 53% | L2, 53% | ❌ | 17% |
| Gin | L3, 51% | L2, 56% | ❌ | **50%** |
| gh-cli | L3, 48% | L2, 59% | ❌ | **50%** |
| Express | L2, 28% | L1, 35% | ❌ | 17% |

### L3 Gap Investigation

**Root Cause Analysis:**
The original profile had L3 checks that were too strict for library projects:
- `product.feature_flags` at L3 - libraries don't need feature flag SDKs
- `product.analytics` at L3 - libraries don't need analytics SDKs
- Integration test patterns were JS/TS only
- Logging detection was Node.js only

**Fixes Applied:**
1. **Moved product checks to L4:** `product.feature_flags` and `product.analytics` are application-level requirements, not appropriate for libraries/CLIs
2. **Added multi-language integration tests:** Python (`**/integration/**/test_*.py`, `**/test_integration*.py`), Go (`**/*_integration_test.go`), E2E patterns
3. **Added multi-language logging frameworks:** Python (loguru, structlog), Go (zap, zerolog, logrus, slog), Rust (tracing, env_logger)

**Results After Fixes:**
- L3 progress improved from 13-25% to 50% for Gin and gh-cli
- Now 3/6 L3 checks passing (was 1-2/8)
- Need 80% (5/6) to achieve L3

**Remaining L3 Checks (6 total):**
| Check | Gin | gh-cli | Notes |
|-------|-----|--------|-------|
| docs.changelog | ✅ | ❌ | Gin has CHANGELOG.md |
| test.integration_tests | ✅ | ✅ | Multi-lang patterns work |
| security.dependabot | ✅ | ✅ | Both have it |
| security.codeowners | ❌ | ✅ | gh-cli has CODEOWNERS |
| observability.logging | ❌ | ❌ | Use stdlib logging |
| env.docker_compose | ❌ | ❌ | Not needed for libraries |

### Factory.ai Documentation Insights

From [Factory.ai Agent Readiness Docs](https://docs.factory.ai/web/agent-readiness):

| Level | Name | Key Criteria |
|-------|------|--------------|
| L1 | Functional | README, linter, type checker, unit tests |
| L2 | Documented | AGENTS.md, devcontainer, pre-commit hooks |
| L3 | Standardized | Integration tests, secret scanning, distributed tracing, metrics |
| L4 | Optimized | Fast CI feedback, deployment frequency |
| L5 | Autonomous | Self-improving systems |

**Key Insight:** Factory.ai requires 80% of **previous** level to unlock next level. Our repos are at L2 with 50% L3 progress - close but not quite matching Factory.ai's L3.

### Known Adjustments

1. **Threshold:** 80% per level (Factory.ai compatible)
2. **L3 Rebalancing:** Moved product.feature_flags and product.analytics to L4
3. **Multi-language support:** Added Python, Go, Rust, Java, Ruby patterns
4. **Integration tests:** Added Python, Go, E2E patterns (was JS/TS only)
5. **Logging frameworks:** Added 8 more frameworks (Python, Go, Rust)
6. **Contributing guide:** Added docs/contributing.rst pattern
7. **PR template:** Added lowercase variant
8. **Lock files:** Added uv.lock, requirements.txt
9. **GitHub Actions:** Pattern matches SHA hashes

## Multi-Repository Test Results

**Total Repos:** 12
**Success Rate:** 100% (all scans complete)

### Results by Repository

| Repository | Language | Level | Score | L2 Score |
|------------|----------|-------|-------|----------|
| next.js | TypeScript | **L3** | 65% | High |
| flask | Python | **L2** | 62% | 82% |
| gh-cli | Go | **L2** | 56% | 71% |
| fastapi | Python | **L2** | 53% | 71% |
| gin | Go | **L2** | 53% | 65% |
| react | JavaScript | L1 | 53% | Medium |
| vue | TypeScript | L1 | 47% | Medium |
| alacritty | Rust | L1 | 44% | Medium |
| cobra | Go | L1 | 41% | Medium |
| ripgrep | Rust | L1 | 38% | Low |
| django | Python | L1 | 35% | Low |
| express | JavaScript | L1 | 35% | 35% |

### Level Distribution

```
L1: ████████████████████ 7 repos (58%)
L2: ████████████         4 repos (33%)
L3: ██                   1 repo  (8%)
```

## Multi-Language Support

agent-ready supports polyglot repositories with language-specific detection:

### Package Manifests Detected
- Node.js: `package.json`
- Python: `pyproject.toml`, `setup.py`
- Go: `go.mod`
- Rust: `Cargo.toml`
- Java: `pom.xml`, `build.gradle`
- Ruby: `Gemfile`

### Linters Detected
- JavaScript: ESLint, Prettier, Biome
- Python: Ruff, Black, Flake8 (via pyproject.toml)
- Go: golangci-lint
- Rust: rustfmt, clippy

### Test Files Detected
- JavaScript/TypeScript: `*.test.ts`, `*.spec.ts`
- Python: `test_*.py`, `*_test.py`, `conftest.py`
- Go: `*_test.go`
- Rust: `tests/**/*.rs`

### Build Commands
- Node.js: package.json scripts
- Python: pyproject.toml (implicit build/test)
- Go: go.mod (implicit build/test)
- Rust: Cargo.toml (implicit build/test)

## Recommendations for v0.1.0 Release

To match Factory.ai results more closely:

1. ✅ **L3 criteria investigated:** Moved product checks to L4, added multi-language patterns
2. ⚠️ **Express gap:** Express is L2 in Factory.ai but L1 in ours (needs L2 check investigation)
3. ✅ Multi-language support verified
4. ✅ Factory.ai pillar/level spec compliance verified
5. ✅ Gating logic implemented (80% threshold)
6. ⚠️ **observability.logging:** Consider recognizing stdlib logging or making optional for libraries
7. ⚠️ **env.docker_compose:** Consider making optional for library/CLI projects

## Conclusion

agent-ready v0.0.1 is **Factory.ai compatible** with documented differences:

### What Works ✅
- Exact 9 Pillars / 5 Levels model implementation
- Multi-language repository support (Python, Go, Rust, JS/TS, Java, Ruby)
- 100% scan success rate across 12 popular OSS repos
- L2 level matches Factory.ai for Flask
- L3 progress improved from 13-25% to 50% after fixes

### Known Differences ⚠️
- Level match rate: 1/5 (20%) with Factory.ai
- Repos at L2 with 50% L3 progress vs Factory.ai's L3
- Some L3 checks (logging, docker_compose) may be too strict for libraries

### Technical Decisions
- Threshold: 80% per level (Factory.ai compatible)
- Product checks (feature_flags, analytics) moved to L4 for library compatibility
- Multi-language patterns added for integration tests and logging frameworks

The tool provides actionable readiness reports for AI agent development across polyglot codebases.
