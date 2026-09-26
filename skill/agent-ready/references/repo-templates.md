# Repository Templates Reference

Structured templates reduce friction for contributors and make issues and PRs parseable by agents. When an issue is a free-text wall, an agent must guess where the reproduction steps end and the expected behavior begins. When an issue is a YAML form with labeled fields, parsing is trivial.

This reference covers what to check, what good looks like, and how to generate project-specific templates.

---

## Table of Contents

1. [Issue Forms (YAML)](#1-issue-forms-yaml)
2. [Issue Template Config](#2-issue-template-config)
3. [PR Template](#3-pr-template)
4. [CODEOWNERS](#4-codeowners)
5. [CONTRIBUTING.md](#5-contributingmd)
6. [SECURITY.md](#6-securitymd)
7. [LICENSE](#7-license)
8. [.gitignore](#8-gitignore)
9. [.gitattributes](#9-gitattributes)
10. [Common Mistakes](#10-common-mistakes)
11. [Verification](#11-verification)

---

## 1. Issue Forms (YAML)

### Why YAML Forms Over Markdown Templates

Markdown templates (`.md`) are freeform text with HTML comments as hints. Contributors delete the hints, skip sections, and produce inconsistent issues. YAML issue forms (`.yml`) render as structured HTML forms with dropdowns, required fields, and validation. The output is machine-parseable with labeled sections.

**Prefer YAML forms for every issue type.** Reserve Markdown templates only for platforms that do not support YAML forms.

### What to Check

```
Glob: .github/ISSUE_TEMPLATE/*.yml
Glob: .github/ISSUE_TEMPLATE/*.yaml
Glob: .github/ISSUE_TEMPLATE/*.md    # legacy — should migrate
```

Look for:
- At least a bug report and feature request form
- Required fields on critical inputs (description, steps to reproduce)
- Dropdowns for categorical data (severity, component, OS)
- Validation attributes where applicable

### Bug Report Form Example

File: `.github/ISSUE_TEMPLATE/bug_report.yml`

```yaml
name: Bug Report
description: Report a bug or unexpected behavior
title: "[Bug]: "
labels: ["bug", "triage"]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Thank you for reporting a bug. Fill out the form below
        so we can investigate quickly.

  - type: textarea
    id: description
    attributes:
      label: Description
      description: A clear summary of the bug.
      placeholder: What happened?
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: Minimal steps to trigger the bug.
      placeholder: |
        1. Run `npm start`
        2. Navigate to /settings
        3. Click "Save" with empty form
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What should happen instead?
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: Actual Behavior
      description: What actually happens? Include error messages or screenshots.
    validations:
      required: true

  - type: dropdown
    id: severity
    attributes:
      label: Severity
      options:
        - "Critical — app crashes or data loss"
        - "High — feature broken, no workaround"
        - "Medium — feature broken, workaround exists"
        - "Low — cosmetic or minor inconvenience"
    validations:
      required: true

  - type: dropdown
    id: os
    attributes:
      label: Operating System
      multiple: true
      options:
        - macOS
        - Linux
        - Windows
        - Other
    validations:
      required: false

  - type: input
    id: version
    attributes:
      label: Version
      description: Output of `your-tool --version` or package version.
      placeholder: "1.2.3"
    validations:
      required: true

  - type: textarea
    id: logs
    attributes:
      label: Relevant Logs
      description: Paste any relevant log output.
      render: shell

  - type: checkboxes
    id: search
    attributes:
      label: Pre-submission Checklist
      options:
        - label: I searched existing issues and this is not a duplicate
          required: true
```

### Feature Request Form Example

File: `.github/ISSUE_TEMPLATE/feature_request.yml`

```yaml
name: Feature Request
description: Suggest a new feature or improvement
title: "[Feature]: "
labels: ["enhancement"]

body:
  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: What problem does this feature solve?
      placeholder: "I'm frustrated when..."
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: How should this work?
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered
      description: What other approaches did you consider?
    validations:
      required: false

  - type: dropdown
    id: category
    attributes:
      label: Category
      options:
        - Performance
        - Developer Experience
        - New Functionality
        - Integration
        - Documentation
        - Other
    validations:
      required: true

  - type: dropdown
    id: priority
    attributes:
      label: How important is this to you?
      options:
        - "Nice to have"
        - "Important — affects my workflow"
        - "Critical — blocking my use case"
    validations:
      required: true

  - type: textarea
    id: context
    attributes:
      label: Additional Context
      description: Screenshots, mockups, related issues, or links.
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Use `textarea` with `render: shell` for logs | Wraps output in a code block automatically |
| Make `description` and `reproduction` required | Prevents empty or vague reports |
| Use `dropdown` for severity | Prevents free-text like "urgent!!!" |
| Add a duplicate-check checkbox | Reduces noise from known issues |
| Use `multiple: true` on OS dropdown | Bugs may affect multiple platforms |

---

## 2. Issue Template Config

File: `.github/ISSUE_TEMPLATE/config.yml`

This file controls the issue chooser page. Disable blank issues to force contributors through structured forms.

```yaml
blank_issues_enabled: false
contact_links:
  - name: Questions & Discussion
    url: https://github.com/your-org/your-repo/discussions
    about: Use Discussions for questions. Issues are for bugs and feature requests.
  - name: Security Vulnerability
    url: https://github.com/your-org/your-repo/security/advisories/new
    about: Report security vulnerabilities privately. Do NOT open a public issue.
```

### Why Disable Blank Issues

Blank issues bypass all templates. Contributors paste unstructured text that agents cannot reliably parse. With `blank_issues_enabled: false`, every issue goes through a form. The `contact_links` entries redirect questions and security reports to the correct channels.

---

## 3. PR Template

File: `.github/PULL_REQUEST_TEMPLATE.md`

PR templates remain Markdown (GitHub does not support YAML PR forms). Use a checklist format that is easy to scan and that agents can auto-fill.

```markdown
## Summary

<!-- One to three sentences describing what this PR does and why. -->

## Related Issues

<!-- Link to issues this PR addresses. Use "Closes #123" to auto-close. -->

- Closes #

## Changes

<!-- Bullet list of the meaningful changes. -->

-

## Testing

<!-- How was this tested? Include commands, screenshots, or test output. -->

- [ ] Unit tests pass (`npm test`)
- [ ] Manual testing completed
- [ ] New tests added for new functionality

## Review Checklist

- [ ] Code follows project style guidelines
- [ ] Self-reviewed for obvious errors
- [ ] No secrets, credentials, or PII added
- [ ] Documentation updated (if applicable)
- [ ] Breaking changes noted (if applicable)
```

### Template Design Principles

- **Summary section first.** Reviewers and agents read top-down.
- **"Closes #" syntax.** Auto-links and auto-closes the issue on merge.
- **Checklist items are checkboxes.** GitHub renders them as interactive boxes. Agents can detect checked vs unchecked by parsing `- [x]` vs `- [ ]`.
- **Testing section is explicit.** Forces the author to state how they verified the change, not just "it works."

---

## 4. CODEOWNERS

File: `.github/CODEOWNERS` (can also live at root or `docs/`)

CODEOWNERS defines who is automatically requested for review when files in matching paths change. GitHub applies it on every PR.

### Syntax

```
# Each line: pattern owner(s)
# Owners can be @username, @org/team-name, or email

# Default owners for everything
*                       @your-org/core-team

# Frontend
/src/components/        @your-org/frontend-team
/src/styles/            @your-org/frontend-team

# Backend
/src/api/               @your-org/backend-team
/src/services/          @your-org/backend-team

# Infrastructure
/terraform/             @your-org/infra-team
/.github/workflows/     @your-org/infra-team
Dockerfile              @your-org/infra-team

# Documentation — anyone can contribute, but docs team reviews
/docs/                  @your-org/docs-team
README.md               @your-org/docs-team

# Security-sensitive files — security team MUST review
SECURITY.md             @your-org/security-team
/src/auth/              @your-org/security-team @your-org/backend-team
```

### Critical Rule: Last Match Wins

CODEOWNERS uses **last matching pattern wins**, not first. This is the opposite of `.gitignore` (which also uses last-match-wins, but people often confuse the mental model).

```
# Example: Who reviews /src/api/auth/login.ts?

/src/            @alice          # matches — but keep scanning
/src/api/        @bob            # matches — but keep scanning
/src/api/auth/   @carol          # matches — last match → @carol is the owner
```

If you want `@alice` to review ALL of `/src/`, place her rule LAST or use a more specific pattern. The common mistake is putting the broad catch-all first and expecting it to apply everywhere — it gets overridden by more specific patterns below it.

### Verification

```bash
# After adding CODEOWNERS, open a PR that touches a file in each path.
# GitHub will show "Review required" from the expected team.
# You can also use:
gh api repos/{owner}/{repo}/collaborators --jq '.[].login'
```

---

## 5. CONTRIBUTING.md

File: `CONTRIBUTING.md` (root of repository)

This file describes the development workflow. It should reflect actual project practices, not aspirational ones.

### Structure

```markdown
# Contributing to <Project Name>

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy environment: `cp .env.example .env`
4. Run tests: `npm test`
5. Start dev server: `npm run dev`

## Branch Naming

Use the format: `type/short-description`

- `feat/add-user-search`
- `fix/null-pointer-on-login`
- `docs/update-api-reference`
- `refactor/extract-auth-module`

## Making Changes

1. Create a branch from `main`
2. Make small, focused commits
3. Write or update tests for your changes
4. Run the full test suite before pushing
5. Open a PR using the template

## Testing Expectations

- All new code must have tests
- Maintain or improve code coverage
- Run `npm test` locally before pushing
- Integration tests: `npm run test:e2e` (requires Docker)

## PR Process

1. Fill out the PR template completely
2. Link related issues with "Closes #123"
3. Request review from CODEOWNERS (auto-assigned)
4. Address all review comments
5. Squash-merge after approval

## Code Style

This project uses [ESLint/Prettier | Ruff/Black | etc.] for code style.
Run `npm run lint` to check and `npm run format` to auto-fix.

Do not disable lint rules without team discussion.

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description

Optional body with more detail.
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`
```

### Why It Matters for Agents

Agents read CONTRIBUTING.md to learn:
- How to name branches (pattern matching)
- What commands to run before submitting
- What commit message format to use
- Where tests go and how to run them

A missing or outdated CONTRIBUTING.md forces agents to guess at conventions.

---

## 6. SECURITY.md

File: `SECURITY.md` (root of repository)

Vulnerability reports must go through a private channel, never a public issue. SECURITY.md tells reporters how to reach you.

```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 2.x     | :white_check_mark: |
| 1.x     | Security fixes only |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Email: security@your-org.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Impact assessment
- Suggested fix (if any)

## Response Timeline

| Action              | Target    |
|---------------------|-----------|
| Acknowledgment      | 48 hours  |
| Initial assessment  | 5 days    |
| Fix or mitigation   | 30 days   |
| Public disclosure    | 90 days   |

## Scope

The following are in scope:
- The main application and API
- Official client libraries
- CI/CD pipeline configuration

The following are out of scope:
- Third-party dependencies (report upstream)
- Social engineering attacks
- Denial of service attacks

## Recognition

We credit reporters in our release notes (unless you prefer anonymity).
```

### Key Points

- **Email, not public issue.** This is the single most important rule.
- **Response timeline.** Sets expectations so reporters do not feel ignored.
- **Supported versions.** Tells reporters whether their version will get a fix.
- **Scope.** Prevents reports about things you cannot control.

---

## 7. LICENSE

File: `LICENSE` (root of repository)

Every project needs a license file. Without one, the code is technically "all rights reserved" regardless of what the README says.

- **MIT** is the most common default for open-source projects. Permissive, simple, widely understood.
- **Apache 2.0** adds patent grant protection. Preferred by larger organizations.
- **GPL/AGPL** for copyleft requirements.

Use GitHub's license picker when creating a repository, or copy a template from [choosealicense.com](https://choosealicense.com/).

Do not modify license text. Do not add custom clauses. Use a standard SPDX-identified license.

---

## 8. .gitignore

File: `.gitignore` (root of repository)

Start with the appropriate language template from [github.com/github/gitignore](https://github.com/github/gitignore) or [gitignore.io](https://www.toptal.com/developers/gitignore), then customize for your project.

### What to Check

```bash
# Verify secrets are excluded
grep -q '\.env' .gitignore      # Environment files
grep -q '\.pem' .gitignore      # Private keys
grep -q 'node_modules' .gitignore  # Dependencies (JS)
```

### Minimum Patterns by Language

**JavaScript/TypeScript:**
```gitignore
node_modules/
dist/
build/
.env
.env.local
.env.*.local
*.tgz
coverage/
.nyc_output/
```

**Python:**
```gitignore
__pycache__/
*.py[cod]
*.egg-info/
dist/
build/
.venv/
venv/
.env
.coverage
htmlcov/
```

**Go:**
```gitignore
/vendor/
*.exe
*.test
*.out
.env
```

**Universal patterns (add to any project):**
```gitignore
# Secrets
.env
.env.local
*.pem
*.key
*.p12

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Debug
*.log
npm-debug.log*
```

### Common Gaps

- Missing `.env` — secrets leak into git history
- Missing `coverage/` — bloats the repo with generated files
- Missing IDE directories — clutters PRs with config changes
- Including lock files in `.gitignore` — lock files (`package-lock.json`, `poetry.lock`) SHOULD be committed

---

## 9. .gitattributes

File: `.gitattributes` (root of repository)

Controls line-ending normalization, diff behavior, and binary file handling. Without it, cross-platform teams get phantom diffs from CRLF/LF mismatches.

### Example

```gitattributes
# Auto-detect text files and normalize line endings
* text=auto

# Force LF for source files (prevents CRLF issues on Windows)
*.ts     text eol=lf
*.tsx    text eol=lf
*.js     text eol=lf
*.jsx    text eol=lf
*.json   text eol=lf
*.css    text eol=lf
*.scss   text eol=lf
*.html   text eol=lf
*.md     text eol=lf
*.yml    text eol=lf
*.yaml   text eol=lf
*.sh     text eol=lf
*.py     text eol=lf
*.go     text eol=lf
*.rs     text eol=lf

# Windows-specific files keep CRLF
*.bat    text eol=crlf
*.cmd    text eol=crlf
*.ps1    text eol=crlf

# Binary files — do not diff or merge
*.png    binary
*.jpg    binary
*.jpeg   binary
*.gif    binary
*.ico    binary
*.webp   binary
*.svg    text
*.woff   binary
*.woff2  binary
*.ttf    binary
*.eot    binary
*.pdf    binary
*.zip    binary
*.tar.gz binary

# Lock files — treat as generated (do not diff in PRs)
package-lock.json  linguist-generated=true
yarn.lock          linguist-generated=true
pnpm-lock.yaml     linguist-generated=true
poetry.lock        linguist-generated=true
Cargo.lock         linguist-generated=true
```

### What Each Directive Does

| Directive | Effect |
|-----------|--------|
| `* text=auto` | Git auto-detects text vs binary. Text files are normalized to LF in the repo. |
| `text eol=lf` | Forces LF line endings in the repo AND in the working tree. |
| `text eol=crlf` | Forces CRLF in the working tree (for Windows scripts). |
| `binary` | No line-ending conversion, no diff, no merge. |
| `linguist-generated=true` | Hides file from GitHub diffs and language stats. |

### Why It Matters

- Without `* text=auto`, a Windows contributor may commit CRLF files that diff against every line on macOS/Linux.
- Without `binary` markers, Git may try to merge PNG files and corrupt them.
- Without `linguist-generated`, a `package-lock.json` change shows thousands of lines in PR diffs, hiding real changes.

---

## 10. Common Mistakes

### Issue Templates

| Mistake | Why It Is Wrong | Fix |
|---------|-----------------|-----|
| Using `.md` templates when YAML is available | Freeform text is unparseable by agents | Migrate to `.yml` forms |
| No required fields | Contributors submit empty issues | Add `validations: required: true` |
| Too many required fields | Contributors abandon the form | Require only: description, reproduction, version |
| Free-text severity field | Get values like "URGENT!!!" | Use a dropdown with defined options |
| No `config.yml` | Blank issues bypass all templates | Add config with `blank_issues_enabled: false` |

### PR Template

| Mistake | Why It Is Wrong | Fix |
|---------|-----------------|-----|
| No testing section | PRs merged without verification | Add explicit testing checklist |
| No "Closes #" prompt | Issues stay open after fix | Include `Closes #` in template |
| Overly long template | Contributors delete sections | Keep to five sections max |

### CODEOWNERS

| Mistake | Why It Is Wrong | Fix |
|---------|-----------------|-----|
| Assuming first match wins | Last match wins — wrong owner gets assigned | Put broad rules first, specific rules last |
| Using usernames that left the org | Reviews never get assigned | Audit quarterly; use team slugs instead |
| No catch-all `*` rule | Files outside any pattern have no owner | Add `* @org/core-team` as the first line |
| Requiring CODEOWNERS approval but not protecting the branch | Owners are requested but not required | Enable branch protection with required CODEOWNERS reviews |

### .gitignore

| Mistake | Why It Is Wrong | Fix |
|---------|-----------------|-----|
| Missing `.env` | Secrets committed to history | Add `.env` and audit git history |
| Ignoring lock files | Builds are not reproducible | Remove lock files from `.gitignore` |
| No IDE patterns | PRs cluttered with `.vscode/` changes | Add `.idea/`, `.vscode/` patterns |

### SECURITY.md

| Mistake | Why It Is Wrong | Fix |
|---------|-----------------|-----|
| "Open an issue" for vulnerabilities | Public disclosure before fix | Use email or GitHub Security Advisories |
| No response timeline | Reporters feel ignored, go public | Add SLA table |

---

## 11. Verification

After creating or updating templates, verify they work correctly.

### Issue Forms

```bash
# 1. Push the YAML files to the default branch
# 2. Go to: https://github.com/{owner}/{repo}/issues/new/choose
# 3. Verify:
#    - Each form renders with correct fields
#    - Required fields show validation errors when empty
#    - Dropdowns display all options
#    - Blank issue option is NOT shown (if config.yml disables it)
#    - Contact links appear at bottom
```

### PR Template

```bash
# 1. Open a new PR from any branch
# 2. Verify the template pre-fills the description
# 3. Check that checkboxes render as interactive items
```

### CODEOWNERS

```bash
# 1. Open a PR that touches files in different paths
# 2. Verify the correct reviewers are auto-requested
# 3. Check the "Reviewers" sidebar matches expected CODEOWNERS
gh pr view <number> --json reviewRequests
```

### .gitattributes

```bash
# Verify line endings are normalized
git ls-files --eol | head -20
# Output shows i/lf (index=LF) and w/lf (working tree=LF) for source files

# After adding .gitattributes to an existing repo, renormalize:
git add --renormalize .
git commit -m "chore: normalize line endings"
```

### Programmatic Checks (for CI)

```bash
# Verify required files exist
test -f .github/ISSUE_TEMPLATE/bug_report.yml    || echo "MISSING: bug_report.yml"
test -f .github/ISSUE_TEMPLATE/feature_request.yml || echo "MISSING: feature_request.yml"
test -f .github/ISSUE_TEMPLATE/config.yml         || echo "MISSING: config.yml"
test -f .github/PULL_REQUEST_TEMPLATE.md           || echo "MISSING: PR template"
test -f .github/CODEOWNERS                         || echo "MISSING: CODEOWNERS"
test -f CONTRIBUTING.md                            || echo "MISSING: CONTRIBUTING.md"
test -f SECURITY.md                                || echo "MISSING: SECURITY.md"
test -f LICENSE                                    || echo "MISSING: LICENSE"
test -f .gitignore                                 || echo "MISSING: .gitignore"
test -f .gitattributes                             || echo "MISSING: .gitattributes"

# Verify config.yml disables blank issues
grep -q 'blank_issues_enabled: false' .github/ISSUE_TEMPLATE/config.yml \
  || echo "WARNING: blank issues not disabled"

# Verify CODEOWNERS has a catch-all
head -n 20 .github/CODEOWNERS | grep -q '^\*' \
  || echo "WARNING: no catch-all rule in CODEOWNERS"

# Verify .env is gitignored
grep -q '\.env' .gitignore \
  || echo "WARNING: .env not in .gitignore"
```

---

## Quick Reference: File Locations

| File | Path | Format |
|------|------|--------|
| Bug report form | `.github/ISSUE_TEMPLATE/bug_report.yml` | YAML |
| Feature request form | `.github/ISSUE_TEMPLATE/feature_request.yml` | YAML |
| Issue chooser config | `.github/ISSUE_TEMPLATE/config.yml` | YAML |
| PR template | `.github/PULL_REQUEST_TEMPLATE.md` | Markdown |
| Code owners | `.github/CODEOWNERS` | Custom syntax |
| Contributing guide | `CONTRIBUTING.md` | Markdown |
| Security policy | `SECURITY.md` | Markdown |
| License | `LICENSE` | Plain text |
| Git ignore rules | `.gitignore` | gitignore syntax |
| Git attributes | `.gitattributes` | gitattributes syntax |
