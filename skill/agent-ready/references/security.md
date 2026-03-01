# Security Reference

GitHub security features that prevent secrets from leaking, dependencies from rotting, and vulnerabilities from shipping.

---

## Why Security Matters for Agents

AI coding agents operate at speed. A human might pause before committing an API key. An agent will not -- unless a guardrail stops it. Agents also generate dependency additions freely, and without automated scanning, vulnerable packages accumulate silently.

Security features are the guardrails that let agents move fast without introducing risk at scale:

- **Push protection** blocks a committed secret before it enters git history. No cleanup needed.
- **Dependabot** keeps dependencies patched without human intervention.
- **Secret scanning** catches credentials that slipped through before push protection existed.
- **CodeQL** finds vulnerability patterns in the code itself.

**Principle:** Security features are free for public repos. The cost of enabling them is minutes; the cost of not enabling them is incident response.

---

## What to Check

Before generating security config, detect what already exists:

```
Glob: .github/dependabot.yml
Glob: .github/CODEOWNERS
Glob: SECURITY.md
Glob: .github/workflows/codeql*.yml
```

Also check repository settings via the API:

```bash
# Check if push protection is enabled
gh api repos/{owner}/{repo}/code-scanning/default-setup 2>/dev/null

# Check secret scanning status
gh api repos/{owner}/{repo} --jq '.security_and_analysis'

# Check Dependabot alerts status
gh api repos/{owner}/{repo}/vulnerability-alerts -i 2>/dev/null | head -1
```

Read each existing file. Identify:

| Question | Why |
|----------|-----|
| Is `.github/dependabot.yml` present? | Core dependency management |
| Does it use grouped updates? | Without grouping, Dependabot creates 20+ PRs |
| Is `CODEOWNERS` present? | Review gates for security-sensitive files |
| Is `SECURITY.md` present? | Vulnerability reporting channel |
| Are there CodeQL workflows? | Static analysis for vulnerabilities |

---

## 1. Push Protection

The single most impactful security feature. Proactive -- blocks secrets before they land in git history. Reactive scanning finds secrets after the damage is done; push protection prevents the damage.

### Status

- **Free** for all public repos since 2024.
- **On by default** for new public repos since 2024.
- Blocks pushes containing detected secrets (API keys, tokens, passwords).
- Supports 200+ token patterns from partner providers.

### How to Enable

**Via GitHub UI:**

Settings > Code security > Push protection > Enable

**Via API:**

```bash
gh api repos/{owner}/{repo} \
  --method PATCH \
  --field security_and_analysis[secret_scanning_push_protection][status]=enabled
```

### How to Verify

```bash
# Returns "enabled" or "disabled"
gh api repos/{owner}/{repo} \
  --jq '.security_and_analysis.secret_scanning_push_protection.status'
```

### What Happens on Push

When push protection detects a secret:

1. The push is **blocked** with an error message identifying the secret type and location.
2. The developer (or agent) must remove the secret and push again.
3. No secret enters git history. No rotation needed.

If a developer needs to bypass (e.g., a test fixture with a fake token), they can mark it as a false positive through the GitHub UI. Agents should never bypass push protection.

---

## 2. Secret Scanning

Complements push protection by scanning existing repository content and git history for leaked credentials.

### Status

- **Enabled by default** on all public repos since 2024.
- Detects tokens, API keys, and credentials from 200+ service providers.
- Alerts repo admins when secrets are found.

### How to Enable (if not already active)

```bash
gh api repos/{owner}/{repo} \
  --method PATCH \
  --field security_and_analysis[secret_scanning][status]=enabled
```

### How to Verify

```bash
gh api repos/{owner}/{repo} \
  --jq '.security_and_analysis.secret_scanning.status'

# List any active alerts
gh api repos/{owner}/{repo}/secret-scanning/alerts --jq '.[].secret_type_display_name'
```

---

## 3. Dependabot

Automated dependency updates via pull requests. Without configuration, Dependabot may create dozens of individual PRs -- one per outdated package. Grouped updates solve this.

### Configuration File

`.github/dependabot.yml`

### Node.js Example (grouped updates)

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
      day: monday
    groups:
      dependencies:
        patterns:
          - "*"
    commit-message:
      prefix: "deps"
    open-pull-requests-limit: 10
```

### Python Example (grouped updates)

```yaml
version: 2
updates:
  - package-ecosystem: pip
    directory: /
    schedule:
      interval: weekly
      day: monday
    groups:
      dependencies:
        patterns:
          - "*"
    commit-message:
      prefix: "deps"
    open-pull-requests-limit: 10
```

### GitHub Actions Example

Always include an entry for GitHub Actions to keep workflow action versions current:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    groups:
      dependencies:
        patterns:
          - "*"

  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
    groups:
      actions:
        patterns:
          - "*"
```

### Key Details

**Grouped updates** are essential. Without them, a project with 30 outdated dependencies gets 30 separate PRs. With grouping, all compatible updates arrive in a single PR:

```yaml
groups:
  dependencies:
    patterns:
      - "*"           # Group everything together
```

For more granular control, split production and dev dependencies:

```yaml
groups:
  production:
    dependency-type: production
  development:
    dependency-type: development
```

**Schedule**: Weekly is the right cadence. Daily creates noise. Monthly lets vulnerabilities linger.

**open-pull-requests-limit**: Caps how many PRs Dependabot will have open simultaneously. Default is 5. Set to 10 if you want more throughput.

### Auto-merge for Patch Versions

Combine Dependabot with a GitHub Actions workflow to auto-merge patch updates that pass CI:

```yaml
# .github/workflows/dependabot-auto-merge.yml
name: Auto-merge Dependabot

on:
  pull_request:

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-merge:
    if: github.actor == 'dependabot[bot]'
    runs-on: ubuntu-latest
    steps:
      - uses: dependabot/fetch-metadata@v2
        id: metadata
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - if: steps.metadata.outputs.update-type == 'version-update:semver-patch'
        run: gh pr merge "${{ github.event.pull_request.html_url }}" --auto --squash
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

This auto-merges patch bumps (e.g., 1.2.3 -> 1.2.4) after CI passes. Minor and major updates still require human review.

### How to Enable Dependabot Alerts (API)

```bash
# Enable Dependabot vulnerability alerts
gh api repos/{owner}/{repo}/vulnerability-alerts --method PUT

# Verify alerts are enabled (204 = enabled, 404 = disabled)
gh api repos/{owner}/{repo}/vulnerability-alerts -i 2>/dev/null | head -1
```

---

## 4. CODEOWNERS

Ensures security-sensitive files require review from specific people. Already covered in `repo-templates.md` for general ownership patterns -- this section focuses on the security angle.

### Security-Sensitive Patterns

```
# .github/CODEOWNERS

# Security-critical files -- require security team review
.github/workflows/    @org/security-team
.github/dependabot.yml @org/security-team
CODEOWNERS            @org/security-team
SECURITY.md           @org/security-team

# Infrastructure and secrets config
*.pem                 @org/security-team
*.key                 @org/security-team
docker-compose*.yml   @org/devops
Dockerfile*           @org/devops

# Dependency manifests -- changes affect supply chain
package.json          @org/lead-devs
package-lock.json     @org/lead-devs
pyproject.toml        @org/lead-devs
requirements*.txt     @org/lead-devs
```

### Key Details

**Last match wins.** CODEOWNERS uses the last matching pattern, not the first. Put broad patterns at the top and specific overrides at the bottom:

```
# Broad rule: all src files
/src/    @org/dev-team

# Override: auth module requires security review
/src/auth/    @org/security-team
```

**CODEOWNERS must live in one of:** root `/CODEOWNERS`, `.github/CODEOWNERS`, or `docs/CODEOWNERS`. The `.github/` location is conventional.

**Branch protection required.** CODEOWNERS only enforces reviews when branch protection rules require PR reviews. Without "Require review from Code Owners" enabled, the file has no effect.

---

## 5. CodeQL

GitHub's static analysis engine. Detects security vulnerabilities, bugs, and anti-patterns in source code.

### Default Setup (Recommended)

No config file needed. GitHub auto-detects supported languages and runs analysis.

**Enable via UI:**

Settings > Code security > Code scanning > Default setup > Enable

**Enable via API:**

```bash
gh api repos/{owner}/{repo}/code-scanning/default-setup \
  --method PATCH \
  --field state=configured
```

### Supported Languages

CodeQL default setup auto-detects: JavaScript/TypeScript, Python, Ruby, Go, Java/Kotlin, C/C++, C#, Swift.

### Custom Setup (When Needed)

Only use a custom workflow if you need non-default queries, specific language versions, or additional build steps:

```yaml
# .github/workflows/codeql.yml
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'    # Weekly Monday 6am UTC

permissions:
  security-events: write
  contents: read

jobs:
  analyze:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        language: [javascript-typescript, python]
    steps:
      - uses: actions/checkout@v4

      - uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}

      - uses: github/codeql-action/autobuild@v3

      - uses: github/codeql-action/analyze@v3
```

### How to Verify

```bash
# Check default setup status
gh api repos/{owner}/{repo}/code-scanning/default-setup \
  --jq '.state'

# List recent code scanning alerts
gh api repos/{owner}/{repo}/code-scanning/alerts \
  --jq '.[] | "\(.rule.id): \(.most_recent_instance.location.path)"' \
  | head -10
```

---

## 6. SECURITY.md

A vulnerability disclosure policy. Tells security researchers how to report issues privately instead of opening a public issue (which exposes the vulnerability to everyone).

### Template

```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 2.x     | :white_check_mark: |
| 1.x     | :white_check_mark: (security fixes only) |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

Email: security@yourorg.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Affected versions
- Potential impact

## Response Timeline

| Action | Timeline |
|--------|----------|
| Acknowledgment | Within 48 hours |
| Initial assessment | Within 1 week |
| Fix or mitigation | Within 30 days |
| Public disclosure | After fix is released |

## Scope

This policy applies to the latest release and the main branch.
Out-of-scope: third-party dependencies (report upstream).
```

### Key Details

**Private reporting.** The email address is the critical piece. Public issue trackers expose vulnerabilities. GitHub also supports private vulnerability reporting -- enable it via Settings > Code security > Private vulnerability reporting.

**Supported versions table.** Tells reporters which versions will actually get patched. Do not list unsupported versions as supported -- it creates false expectations.

**Response timeline.** Sets expectations for the reporter. 48-hour acknowledgment is standard. Adjust the fix timeline based on your team's capacity, but always state one.

---

## What to Generate

When setting up security for a specific project:

### Step 1: Detect ecosystem

```
Read: package.json          # → npm ecosystem
Read: pyproject.toml         # → pip ecosystem
Read: go.mod                 # → gomod ecosystem
Glob: .github/workflows/*   # → github-actions ecosystem
```

### Step 2: Generate dependabot.yml

List all ecosystems detected and create entries for each:

```yaml
version: 2
updates:
  # One entry per detected ecosystem
  - package-ecosystem: npm       # from package.json
    directory: /
    schedule:
      interval: weekly
    groups:
      dependencies:
        patterns:
          - "*"

  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
    groups:
      actions:
        patterns:
          - "*"
```

### Step 3: Enable API-based features

```bash
# Enable secret scanning
gh api repos/{owner}/{repo} \
  --method PATCH \
  --field security_and_analysis[secret_scanning][status]=enabled

# Enable push protection
gh api repos/{owner}/{repo} \
  --method PATCH \
  --field security_and_analysis[secret_scanning_push_protection][status]=enabled

# Enable CodeQL default setup
gh api repos/{owner}/{repo}/code-scanning/default-setup \
  --method PATCH \
  --field state=configured

# Enable Dependabot alerts
gh api repos/{owner}/{repo}/vulnerability-alerts --method PUT

# Enable private vulnerability reporting
gh api repos/{owner}/{repo}/private-vulnerability-reporting --method PUT
```

### Step 4: Generate SECURITY.md

Use the template above. Customize:

- Email address (ask the project owner)
- Supported versions (read from package.json `version` or tags)
- Response timeline (adjust to team size)

### Step 5: Add security-sensitive CODEOWNERS entries

Append to existing `.github/CODEOWNERS` or create it:

```
.github/workflows/    @org/security-team
.github/dependabot.yml @org/security-team
SECURITY.md           @org/security-team
```

---

## Common Mistakes

### 1. Not enabling push protection

The most common gap. Push protection is free, on by default for new repos since 2024, but older repos may not have it enabled. It is the single most impactful security feature -- a proactive block is worth a hundred reactive alerts.

Check:
```bash
gh api repos/{owner}/{repo} \
  --jq '.security_and_analysis.secret_scanning_push_protection.status'
```

If `disabled`, enable it immediately.

### 2. Dependabot without grouped updates

Wrong -- creates 20+ individual PRs:
```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    # No groups key → one PR per package
```

Right -- single PR with all updates:
```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    groups:
      dependencies:
        patterns:
          - "*"
```

### 3. CODEOWNERS syntax errors

Wrong -- spaces in team names, missing `@`:
```
src/auth/   security-team           # Missing @ prefix
src/api/    @org/dev team           # Space in team name
```

Right:
```
src/auth/   @org/security-team
src/api/    @org/dev-team
```

Also remember: **last match wins**. If you put a broad pattern after a specific one, the broad pattern overrides:

```
# WRONG ORDER
/src/auth/   @org/security-team    # This is overridden
/src/        @org/dev-team         # This matches /src/auth/ too

# RIGHT ORDER
/src/        @org/dev-team         # Broad first
/src/auth/   @org/security-team    # Specific override last
```

### 4. Ignoring Dependabot alerts

Dependabot opens alerts for known vulnerabilities. Ignoring them is worse than not having Dependabot -- it creates documented evidence that you knew about vulnerabilities and did nothing.

Review alerts weekly:
```bash
gh api repos/{owner}/{repo}/dependabot/alerts \
  --jq '.[] | select(.state == "open") | "\(.security_advisory.summary) [\(.security_vulnerability.severity)]"'
```

### 5. SECURITY.md pointing to public issue tracker

Wrong:
```markdown
## Reporting a Vulnerability
Please open an issue at https://github.com/org/repo/issues
```

This publicly discloses the vulnerability. Always use a private channel (email or GitHub private reporting).

### 6. CodeQL custom workflow when default setup works

If the project uses standard languages with no special build requirements, default setup is simpler and auto-updates. Only create a custom `.github/workflows/codeql.yml` when you need custom queries, specific build steps, or unsupported language configurations.

### 7. Missing github-actions ecosystem in dependabot.yml

Dependencies are not just packages. GitHub Actions are pinned to versions too. Always include:

```yaml
- package-ecosystem: github-actions
  directory: /
  schedule:
    interval: weekly
  groups:
    actions:
      patterns:
        - "*"
```

### 8. Forgetting to enable branch protection for CODEOWNERS

CODEOWNERS without branch protection does nothing. The file defines who should review, but branch protection enforces that reviews are required:

```bash
# Check if branch protection requires CODEOWNERS reviews
gh api repos/{owner}/{repo}/branches/main/protection \
  --jq '.required_pull_request_reviews.require_code_owner_reviews'
```

---

## Verification

After setting up security features, confirm everything is active:

### API Verification Script

```bash
REPO="{owner}/{repo}"

echo "=== Secret Scanning ==="
gh api repos/$REPO --jq '.security_and_analysis.secret_scanning.status'

echo "=== Push Protection ==="
gh api repos/$REPO --jq '.security_and_analysis.secret_scanning_push_protection.status'

echo "=== CodeQL ==="
gh api repos/$REPO/code-scanning/default-setup --jq '.state'

echo "=== Dependabot Alerts ==="
STATUS=$(gh api repos/$REPO/vulnerability-alerts -i 2>/dev/null | head -1)
echo "$STATUS"  # 204 = enabled

echo "=== Private Vulnerability Reporting ==="
gh api repos/$REPO/private-vulnerability-reporting -i 2>/dev/null | head -1
```

### File Verification

```
Glob: .github/dependabot.yml          # Must exist
Glob: .github/CODEOWNERS              # Must exist
Glob: SECURITY.md                     # Must exist
```

Read each file and verify:

| Check | Expected |
|-------|----------|
| `dependabot.yml` has `groups` key | Yes -- avoids PR overload |
| `dependabot.yml` includes `github-actions` ecosystem | Yes |
| `dependabot.yml` schedule is `weekly` | Yes |
| `CODEOWNERS` covers `.github/workflows/` | Yes |
| `CODEOWNERS` covers dependency manifests | Yes |
| `CODEOWNERS` has no syntax errors (missing `@`, spaces in names) | Yes |
| `SECURITY.md` has private reporting email | Yes -- not a public issue link |
| `SECURITY.md` has supported versions table | Yes |
| `SECURITY.md` has response timeline | Yes |

---

## Priority Order

When setting up security for a new repo, enable features in this order:

| Priority | Feature | Why |
|----------|---------|-----|
| 1 | Push protection | Proactive. Blocks secrets before they enter history. Highest impact. |
| 2 | Dependabot with grouped updates | Keeps dependencies patched. Grouped updates prevent PR overload. |
| 3 | CODEOWNERS (security entries) | Gates changes to sensitive files behind review. |
| 4 | CodeQL default setup | Catches vulnerability patterns in code. Zero config needed. |
| 5 | SECURITY.md | Gives researchers a private reporting channel. |
| 6 | Secret scanning | Already on by default for public repos. Verify it is active. |
| 7 | Private vulnerability reporting | Lets reporters use GitHub's built-in private reporting. |

---

## Quick Checklist

Use this when reviewing or setting up security for a repo:

- [ ] Push protection is enabled (not just secret scanning)
- [ ] `.github/dependabot.yml` exists with grouped updates
- [ ] `dependabot.yml` includes all detected ecosystems (npm/pip/gomod + github-actions)
- [ ] `dependabot.yml` schedule is weekly
- [ ] `.github/CODEOWNERS` includes security-sensitive file patterns
- [ ] `CODEOWNERS` syntax is correct (@ prefix, no spaces in names, specific patterns last)
- [ ] Branch protection requires CODEOWNERS reviews
- [ ] `SECURITY.md` exists with private reporting email (not public issue link)
- [ ] `SECURITY.md` has supported versions table and response timeline
- [ ] CodeQL default setup is enabled (or custom workflow if needed)
- [ ] Dependabot alerts are enabled and reviewed regularly
- [ ] No open Dependabot alerts older than 30 days
