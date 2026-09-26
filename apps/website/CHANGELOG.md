# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.3] - 2026-01-28

### Added
- L0 (Starting) level in scan.schema.json
- Level range now: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | null
- LEVEL_NAMES[0] = 'Starting' for L0 display

### Changed
- All Level enums expanded from L1-L5 to L0-L5
- LEVEL_BG_CLASSES[0] = 'bg-slate-400' for L0
- LEVEL_TEXT_CLASSES[0] = 'text-slate-400' for L0

## [0.0.2] - 2026-01-28

### Changed
- Level format: string values 'L1'-'L5' or `null` (aligned with CLI)
- JSON Schema upgraded to Draft 2020-12
- Pillar enum now includes all 11 pillars
- CheckResult.level changed from number to string enum

### Fixed
- Cross-project consistency with CLI type definitions
- PillarResult.level_achieved now uses string format
- level_progress chart items use string level identifiers

## [0.0.1] - 2026-01-27

### Added
- Initial release of Agent Ready Website
- React 19 frontend with Vite build
- Tailwind CSS 4 styling
- Scan form and result visualization components
- D3-based radar chart for pillar scores
- Cloudflare Pages deployment
- Contract tests for API types and hooks
- Spec-first architecture with JSON Schema

[Unreleased]: https://github.com/upki-ai/agent-ready-website/compare/v0.0.3...HEAD
[0.0.3]: https://github.com/upki-ai/agent-ready-website/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/upki-ai/agent-ready-website/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/upki-ai/agent-ready-website/releases/tag/v0.0.1
