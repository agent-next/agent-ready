# Factory Agent Readiness Comparison

This document compares our agent-ready implementation with [Factory's official Agent Readiness Model](https://docs.factory.ai/web/agent-ready/overview).

## Executive Summary

| Aspect | Factory | Our Implementation | Gap |
|--------|---------|-------------------|-----|
| Levels | 5 (L1-L5) | 5 (L1-L5) | ✅ Match |
| Gating Rule | 80% threshold | 80% threshold | ✅ Match |
| Pillars | 9 | 10 | ✅ Includes task_discovery |
| Total Checks | ~40+ | 33 | ✅ Core parity achieved |
| Monorepo Support | App-scoped | Basic detection | ⚠️ Less sophisticated |
| CLI Command | `/readiness-report` | `agent-ready scan` | ✅ Equivalent |

## Pillar-by-Pillar Analysis

### 1. Documentation

| Factory Criteria | Our Check | Status |
|-----------------|-----------|--------|
| AGENTS.md exists | `docs.agents_md` | ✅ |
| README exists | `docs.readme` | ✅ |
| README has sections | `docs.readme_sections` | ✅ |
| CONTRIBUTING guide | `docs.contributing` | ✅ |
| CHANGELOG | `docs.changelog` | ✅ |
| Documentation freshness | ❌ Missing | ⏳ Future (requires git analysis) |

### 2. Style & Validation

| Factory Criteria | Our Check | Status |
|-----------------|-----------|--------|
| Linter configuration | `style.linter_config` | ✅ |
| Type checker setup | `style.typescript` | ✅ |
| Code formatter | `style.prettier` (in any_of) | ✅ |
| Pre-commit hooks | `style.precommit_hooks` | ✅ Implemented in v0.1.0 |
| EditorConfig | `style.editorconfig` | ✅ |

### 3. Build System

| Factory Criteria | Our Check | Status |
|-----------------|-----------|--------|
| Build command exists | `build.scripts` | ✅ |
| Pinned dependencies (lock file) | `build.lock_file` | ✅ |
| Package manifest | `build.package_json` | ✅ |
| VCS CLI tools | ❌ Missing | ⏳ Future |

### 4. Testing

| Factory Criteria | Our Check | Status |
|-----------------|-----------|--------|
| Unit tests exist | `test.test_files` | ✅ |
| Test configuration | `test.config` | ✅ |
| Integration tests | `test.integration_tests` | ✅ Implemented in v0.1.0 |
| Local test execution | ❌ Missing | ⏳ Future (requires runtime check) |

### 5. Development Environment

| Factory Criteria | Our Check | Status |
|-----------------|-----------|--------|
| Devcontainer config | `env.devcontainer` | ✅ Implemented in v0.1.0 |
| Environment template | `env.dotenv_example` | ✅ |
| Local services setup | `env.docker_compose` | ✅ Implemented in v0.1.0 |

### 6. Debugging & Observability

| Factory Criteria | Our Check | Status |
|-----------------|-----------|--------|
| Structured logging | `observability.logging` | ✅ |
| Distributed tracing | `observability.tracing` | ✅ Implemented in v0.1.0 |
| Metrics collection | `observability.metrics` | ✅ Implemented in v0.1.0 |

### 7. Security

| Factory Criteria | Our Check | Status |
|-----------------|-----------|--------|
| .gitignore exists | `security.gitignore` | ✅ |
| Secret patterns in .gitignore | `security.gitignore_secrets` | ✅ |
| Dependabot | `security.dependabot` | ✅ |
| Branch protection | ❌ Missing | ⏳ Future (requires GitHub API) |
| Secret scanning | ❌ Missing | ⏳ Future (requires GitHub API) |
| CODEOWNERS file | `security.codeowners` | ✅ Implemented in v0.1.0 |

### 8. Task Discovery

| Factory Criteria | Our Check | Status |
|-----------------|-----------|--------|
| Issue templates | `task_discovery.issue_templates` | ✅ Implemented in v0.1.0 |
| Issue labeling system | ❌ Missing | ⏳ Future (requires GitHub API) |
| PR templates | `task_discovery.pr_template` | ✅ Implemented in v0.1.0 |

### 9. CI/CD (Our Addition)

| Our Check | Factory Equivalent | Status |
|-----------|-------------------|--------|
| `ci.github_workflow` | N/A | ➕ Our addition |
| `ci.push_trigger` | N/A | ➕ Our addition |
| `ci.pr_trigger` | N/A | ➕ Our addition |
| `ci.checkout_action` | N/A | ➕ Our addition |

### 10. Monorepo (Our Addition)

| Our Check | Factory Equivalent | Status |
|-----------|-------------------|--------|
| `monorepo.workspaces` | App-scoped evaluation | ⚠️ Different approach |

Factory handles monorepos through **app-scoped evaluation** built into the framework, not as a separate pillar.

## v0.1.0 Implementation Summary

### New Checks Added

| Check ID | Pillar | Level | Description |
|----------|--------|-------|-------------|
| `style.precommit_hooks` | style | L2 | Husky, pre-commit, lefthook |
| `test.integration_tests` | test | L3 | Integration test patterns |
| `security.codeowners` | security | L3 | CODEOWNERS file detection |
| `observability.tracing` | observability | L4 | OpenTelemetry, Jaeger, etc. |
| `observability.metrics` | observability | L4 | Prometheus, StatsD, etc. |
| `env.devcontainer` | env | L3 | VS Code devcontainer |
| `env.docker_compose` | env | L3 | Docker Compose services |
| `task_discovery.issue_templates` | task_discovery | L2 | GitHub issue templates |
| `task_discovery.pr_template` | task_discovery | L2 | PR template |

### New Check Type Added

- **`dependency_detect`**: Detects packages in package.json, requirements.txt, go.mod, Cargo.toml. Used for tracing and metrics detection.

### New Pillar Added

- **`task_discovery`**: Aligns with Factory's Task Discovery pillar for issue/PR templates and work infrastructure.

## Remaining Gaps (v0.2.0+)

### Requires GitHub API
1. Branch protection policies
2. Secret scanning enabled
3. Issue labeling system

### Requires Runtime/Complex Analysis
1. Documentation freshness (git commit analysis)
2. Local test execution verification
3. VCS CLI tools detection

### Product & Experimentation (Factory Only)
1. Product analytics (Mixpanel, Amplitude, Segment)
2. Experiment infrastructure (feature flags)

## Architectural Differences

### Factory's Approach
- **Integrated platform** with CLI, Web Dashboard, and API
- **Real-time remediation** coming soon
- **GitHub API integration** for branch protection, secret scanning
- **App-scoped evaluation** built into monorepo handling

### Our Approach
- **Standalone CLI tool** only
- **File-based detection** (no API calls required)
- **Profile-driven** extensibility via YAML
- **Monorepo as a pillar** rather than evaluation scope
- **New check types** easily added via TypeScript

## Sources

- [Factory Agent Readiness Overview](https://docs.factory.ai/web/agent-ready/overview)
- [Factory Documentation](https://docs.factory.ai)
