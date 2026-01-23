# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- CHANGELOG.md for version tracking
- Dependabot configuration for automated dependency updates

## [0.1.0] - 2026-01-23

### Added
- Initial release of agent-readiness CLI tool
- Factory-compatible 9 Pillars / 5 Levels maturity model
- YAML-driven profile system with 33 checks
- 8 check types: file_exists, path_glob, any_of, github_workflow_event, github_action_present, build_command_detect, log_framework_detect, dependency_detect
- JSON and Markdown output formats
- Monorepo detection and sub-app scanning
- `scan` command for repository evaluation
- `init` command for generating missing files
- Security hardening: path traversal protection, ReDoS detection
- LRU caching for performance optimization

[Unreleased]: https://github.com/robotlearning123/agent-readiness/compare/main...HEAD
