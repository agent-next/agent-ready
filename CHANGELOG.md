# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- 60% threshold per level (adjusted for Factory.ai compatibility)
- Comprehensive test suite (22 tests)

### Multi-Language Patterns
- Integration tests: JS/TS, Python, Go, E2E
- Logging frameworks: winston, pino, loguru, zap, zerolog, tracing
- Package manifests: package.json, pyproject.toml, go.mod, Cargo.toml, pom.xml, Gemfile

### Validated Against
- 12 popular OSS repositories: Next.js, React, Vue, Flask, FastAPI, Django, Gin, Cobra, gh-cli, ripgrep, alacritty, Express
- 100% scan success rate
- Factory.ai comparison documented in `test/VALIDATION_REPORT.md`

[Unreleased]: https://github.com/anthropics/agent-ready/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/anthropics/agent-ready/releases/tag/v0.0.1
