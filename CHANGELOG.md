# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.6] - 2026-01-28

### Added
- L0 (Starting) as explicit starting level in Level enum
- Level range now: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | null

### Changed
- Level enum expanded from L1-L5 to L0-L5
- `levels` object in scan result now includes L0 entry

## [0.0.5] - 2026-01-28

### Changed
- Clarified Level format: string values 'L1'-'L5' or `null` (no level achieved)
- Updated documentation to reference 11 pillars (added `agent_config`, `code_quality`)
- Default profile is `factory_compat` (consistent across CLI, Backend, Website)

### Fixed
- Cross-project consistency: Level type, pillar count, and default profile now aligned
- SPEC.md clarifies `null` means "no level achieved" (equivalent to legacy L0)

## [0.0.4] - 2026-01-26

### Added
- Spec-first architecture with JSON Schema definitions
- Test coverage tracking with 152 tests

## [0.0.1] - 2026-01-23

### Added
- Initial pre-release of agent-ready CLI tool
- Factory.ai-compatible 9 Pillars / 5 Levels maturity model
- YAML-driven profile system with 35+ checks
- 8 check types: `file_exists`, `path_glob`, `any_of`, `github_workflow_event`, `github_action_present`, `build_command_detect`, `log_framework_detect`, `dependency_detect`
- JSON (`readiness.json`) and Markdown (terminal) output formats
- Monorepo detection and sub-app scanning
- `scan` command for repository evaluation
- `init` command for generating missing files from templates
- Multi-language support: JavaScript/TypeScript, Python, Go, Rust, Java, Ruby
- Claude Code skill (`agent-ready.skill`) for `/agent-ready` command
- Landing page website (`docs/index.html`)
- 80% threshold per level (Factory.ai compatible)
- Comprehensive test suite (22 tests)

### Multi-Language Patterns
- Integration tests: JS/TS, Python, Go, E2E
- Logging frameworks: winston, pino, loguru, zap, zerolog, tracing
- Package manifests: package.json, pyproject.toml, go.mod, Cargo.toml, pom.xml, Gemfile

### Validated Against
- 12 popular OSS repositories: Next.js, React, Vue, Flask, FastAPI, Django, Gin, Cobra, gh-cli, ripgrep, alacritty, Express
- 100% scan success rate
- Factory.ai comparison documented in `test/VALIDATION_REPORT.md`

[Unreleased]: https://github.com/robotlearning123/agent-ready/compare/v0.0.6...HEAD
[0.0.6]: https://github.com/robotlearning123/agent-ready/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/robotlearning123/agent-ready/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/robotlearning123/agent-ready/compare/v0.0.1...v0.0.4
[0.0.1]: https://github.com/robotlearning123/agent-ready/releases/tag/v0.0.1
