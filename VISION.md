# Repository Readiness Vision

> **The design goal:** make it easier to evaluate and improve repositories for AI-assisted development.

AI coding agents work best when the repository gives them clear guidance, reproducible tools, useful feedback, and explicit security boundaries. As agent work scales, behavioral drift, coordination failures, and unsafe configuration become risks that need deliberate controls.

## What Agent-Ready provides

Agent-Ready is a knowledge layer and readiness checker for repository infrastructure. It helps teams understand which supporting practices are present and which need attention:

- The Agent-Ready skill explains practices for nine areas: agent guidance, code quality, testing, CI/CD, hooks, branch rulesets, repository templates, devcontainers, and security.
- The `agent-ready check` CLI reports `present` and `missing` items for those areas, with human-readable or JSON output and an optional strict exit status.
- The `check_repo_readiness` MCP tool exposes the same structured readiness data to AI agents.
- The `init` command can generate supported missing configuration files, with a dry-run option for review first.
- The GitHub Action can run the check and optionally fail when an area has missing items.

These features inspect repository files and configuration signals. A complete or partial area describes what the checker found; it does not demonstrate that an agent can safely operate, that a branch rule is enforced, or that a deployment control works at runtime. With `--strict`, partial and missing areas can produce a nonzero exit; `unknown` areas are treated as non-failing by the checker.

## The nine areas

| Area | Readiness signals |
|------|-------------------|
| Agent Guidance | AGENTS.md, CLAUDE.md, Copilot instructions, and related setup files |
| Code Quality | Linters, formatters, type checking, and editor configuration |
| Testing | Test directories, test runners, and coverage configuration |
| CI/CD | Workflow files and `claude.yml` |
| Hooks | Pre-commit and agent workflow hooks |
| Branch Rulesets | Not verified by the checker; always reported as `unknown`. Use `gh` or the GitHub API separately |
| Templates | Issue forms, pull request templates, CODEOWNERS, and security guidance |
| DevContainer | Reproducible development environment configuration |
| Security | `dependabot.yml` and `SECURITY.md` presence |

The checker identifies repository signals; teams still need to confirm that the corresponding controls are enabled, scoped correctly, and effective.

## Recommended workflow

1. Analyze the project and its language, framework, and structure.
2. Run `npx agent-ready check .` or call `check_repo_readiness`.
3. Read the reference guidance for each missing area.
4. Generate supported starter configuration with the CLI or MCP tool, then adapt it to the project.
5. Run the repository's own lint, tests, and CI checks to verify the result.

## Parallel-agent design goal

Many imperfect agents may eventually work on the same organization’s repositories. A useful design question is:

> Do the repository and delivery controls give each agent clear guidance, bounded permissions, reviewable changes, and feedback when something goes wrong?

Agent-Ready helps identify supporting repository signals for that goal. It does not coordinate an agent fleet, enforce patch isolation, or guarantee safe parallel execution. Validate permissions, branch protection, ownership, conflict handling, testing, and deployment controls in the systems that provide them.

## Scope boundary

Agent-Ready reports and helps generate repository infrastructure. It does not replace the repository’s CI provider, GitHub settings, container runtime, security tooling, deployment system, or human review. Those systems remain responsible for enforcing the controls on which safe agent-assisted development depends.
