# Branch Rulesets

GitHub rulesets for protecting branches when AI agents contribute code. Covers detection, creation via API, essential rules, and verification.

---

## Why This Matters

AI agents produce large volumes of code quickly. Without branch protection, a misconfigured agent pushes broken code directly to `main`. A single bad merge can break production, overwrite human work, or introduce security vulnerabilities before anyone reviews it.

Rulesets enforce the principle: **agents propose, humans approve.**

Every agent-generated change must go through a pull request, pass CI, and receive human review before merging. No exceptions.

---

## Rulesets vs. Legacy Branch Protection

GitHub has two systems. Use rulesets.

| Feature | Rulesets (modern) | Branch protection rules (legacy) |
|---------|-------------------|----------------------------------|
| Multiple rules per branch | Yes, they stack | No, one rule per pattern |
| Org-level scope | Yes | No |
| Evaluate mode (dry run) | Yes | No |
| API consistency | Clean REST API | Older, inconsistent API |
| Future support | Active development | Maintenance only |

**Always use rulesets.** Branch protection rules are legacy and will not receive new features.

---

## What to Check: Detect Existing Rulesets

Before creating rulesets, check what already exists.

### List all rulesets for a repo

```bash
gh api repos/{owner}/{repo}/rulesets
```

Returns an array. Empty array `[]` means no rulesets exist.

### Get details for a specific ruleset

```bash
gh api repos/{owner}/{repo}/rulesets/{ruleset_id}
```

### List org-level rulesets (may also apply)

```bash
gh api orgs/{org}/rulesets
```

### Quick check script

```bash
#!/usr/bin/env bash
# Check if any rulesets protect the default branch
OWNER_REPO="owner/repo"
RULESETS=$(gh api "repos/${OWNER_REPO}/rulesets" --jq 'length')

if [ "$RULESETS" -eq 0 ]; then
  echo "WARNING: No rulesets found. Branch is unprotected."
else
  echo "Found ${RULESETS} ruleset(s)."
  gh api "repos/${OWNER_REPO}/rulesets" \
    --jq '.[] | "  - \(.name) (enforcement: \(.enforcement), target: \(.target))"'
fi
```

---

## What Good Looks Like

A properly configured ruleset enforces six essential rules.

### The Six Essential Rules

| Rule | Purpose |
|------|---------|
| **Require PR before merge** | Agents never push directly to main |
| **Require 1+ human review** | A human must approve every change |
| **Dismiss stale approvals** | New pushes invalidate old approvals |
| **Require status checks** | CI must pass before merge |
| **Prevent branch deletion** | Protected branches cannot be deleted |
| **Prevent force push** | History cannot be rewritten |

### Why Each Rule Matters for Agent Workflows

**Require PR before merge** -- Without this, an agent with push access can commit directly to `main`. This is the most critical rule. It forces all changes through the review pipeline.

**Require 1+ human review** -- Agents should never self-approve. Even if an agent opens a PR, a human must review and approve it. This is non-negotiable for production branches.

**Dismiss stale approvals on new pushes** -- If a human approves a PR and the agent then pushes additional commits, the approval is invalidated. The human must re-review. Without this, an agent could push arbitrary changes after getting initial approval.

**Require status checks to pass** -- CI (lint, test, build, type-check) must succeed. This catches broken code before it reaches `main`, regardless of whether a human or agent wrote it.

**Prevent branch deletion** -- Protects against accidental or malicious deletion of `main` or other protected branches.

**Prevent force push** -- Protects against history rewriting. An agent must never `git push --force` to a protected branch.

---

## What to Generate: Full API Payload

Use `gh api` with `--input -` and piped JSON. This is the recommended approach.

### Standard ruleset creation command

```bash
cat <<'RULESET_JSON' | gh api repos/{owner}/{repo}/rulesets --method POST --input -
{
  "name": "Protect main",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "deletion"
    },
    {
      "type": "non_fast_forward"
    },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "required_status_checks": [
          {
            "context": "ci"
          }
        ]
      }
    }
  ],
  "bypass_actors": []
}
RULESET_JSON
```

### Rule-by-rule breakdown

| JSON `type` | What it does |
|-------------|-------------|
| `deletion` | Prevents branch deletion |
| `non_fast_forward` | Prevents force push |
| `pull_request` | Requires PR with review parameters |
| `required_status_checks` | Requires named CI checks to pass |

### Adjusting the status check context

The `"context": "ci"` value must match the **job name or check name** from your GitHub Actions workflow. Common patterns:

```yaml
# If your workflow has:
jobs:
  ci:          # <-- context is "ci"
    runs-on: ubuntu-latest

  build:       # <-- context is "build"
    runs-on: ubuntu-latest

  test:        # <-- context is "test"
    runs-on: ubuntu-latest
```

To require multiple checks:

```json
"required_status_checks": [
  { "context": "lint" },
  { "context": "test" },
  { "context": "build" }
]
```

### Protecting multiple branches

Change the `include` array to protect additional branches:

```json
"conditions": {
  "ref_name": {
    "include": ["refs/heads/main", "refs/heads/release/*"],
    "exclude": []
  }
}
```

---

## Evaluate Mode: Test Without Blocking

Evaluate mode lets you test a ruleset without actually enforcing it. Rules are evaluated and results are logged, but violations do not block merges.

Use this when rolling out new rules to see what would be blocked before committing to enforcement.

### Create a ruleset in evaluate mode

```bash
cat <<'RULESET_JSON' | gh api repos/{owner}/{repo}/rulesets --method POST --input -
{
  "name": "Protect main (evaluate)",
  "target": "branch",
  "enforcement": "evaluate",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "deletion"
    },
    {
      "type": "non_fast_forward"
    },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "required_status_checks": [
          {
            "context": "ci"
          }
        ]
      }
    }
  ],
  "bypass_actors": []
}
RULESET_JSON
```

The only difference is `"enforcement": "evaluate"` instead of `"active"`.

### Switching from evaluate to active

Once you confirm the ruleset behaves as expected, update the enforcement:

```bash
echo '{"enforcement": "active"}' | \
  gh api repos/{owner}/{repo}/rulesets/{ruleset_id} --method PUT --input -
```

---

## Agent Identity: What NOT to Bypass

### Never add agents to bypass lists

The `bypass_actors` field lets certain users or apps skip ruleset enforcement. **Never add agent bots to this list.**

```json
// WRONG -- do not do this
"bypass_actors": [
  {
    "actor_id": 12345,
    "actor_type": "Integration",
    "bypass_mode": "always"
  }
]
```

If an agent can bypass PR requirements, the entire protection model breaks. The agent could push directly to `main` without review. Keep `bypass_actors` empty or limited to repository administrators who need emergency access.

### Agents must always work through PRs

The correct agent workflow is:

1. Agent creates a feature branch
2. Agent commits changes to the branch
3. Agent opens a pull request
4. CI runs and must pass
5. A human reviews and approves
6. The PR is merged (by a human or by auto-merge after approval)

No step in this workflow requires the agent to bypass rulesets.

---

## Common Mistakes

### 1. Using `-F` flags instead of `--input -`

```bash
# WRONG -- -F doesn't handle booleans and nested objects correctly
gh api repos/{owner}/{repo}/rulesets --method POST \
  -F name="Protect main" \
  -F enforcement="active" \
  -F 'rules[][type]=pull_request'  # breaks with nested parameters

# RIGHT -- always pipe JSON via --input -
cat <<'JSON' | gh api repos/{owner}/{repo}/rulesets --method POST --input -
{ "name": "Protect main", ... }
JSON
```

The `gh api -F` flag sends form fields and cannot correctly encode booleans (`true`/`false` become strings) or nested objects. Always use `--input -` with piped JSON.

### 2. Using legacy branch protection API

```bash
# WRONG -- legacy API
gh api repos/{owner}/{repo}/branches/main/protection --method PUT --input -

# RIGHT -- rulesets API
gh api repos/{owner}/{repo}/rulesets --method POST --input -
```

### 3. Adding agent apps to bypass lists

See the [Agent Identity](#agent-identity-what-not-to-bypass) section. Never do this.

### 4. Forgetting to match status check context names

If your CI workflow job is named `build-and-test` but your ruleset requires context `ci`, the status check will never be satisfied. The context name must match exactly.

### 5. Setting enforcement to `disabled` instead of `evaluate`

- `"enforcement": "active"` -- rules are enforced, violations are blocked
- `"enforcement": "evaluate"` -- rules are evaluated, violations are logged but not blocked
- `"enforcement": "disabled"` -- rules are completely off, nothing is evaluated

Use `evaluate` for testing. `disabled` provides no feedback at all.

### 6. Protecting only `main` when releases use other branches

If your project uses `release/*` branches for production deployments, protect those too. An agent pushing directly to a release branch is just as dangerous as pushing to `main`.

---

## Verification: Confirm Rulesets Are Active

After creating a ruleset, verify it is working correctly.

### Step 1: List rulesets and confirm enforcement status

```bash
gh api repos/{owner}/{repo}/rulesets \
  --jq '.[] | {name, enforcement, id}'
```

Expected output:

```json
{
  "name": "Protect main",
  "enforcement": "active",
  "id": 12345
}
```

### Step 2: Inspect the full ruleset

```bash
gh api repos/{owner}/{repo}/rulesets/{ruleset_id} \
  --jq '{name, enforcement, rules: [.rules[].type]}'
```

Expected output:

```json
{
  "name": "Protect main",
  "enforcement": "active",
  "rules": [
    "deletion",
    "non_fast_forward",
    "pull_request",
    "required_status_checks"
  ]
}
```

Confirm all four rule types are present.

### Step 3: Test that direct push is blocked

```bash
# This should fail with a 403 or push rejection
git push origin main
# Expected: "refused to allow" or similar rejection message
```

### Step 4: Test that PR flow works

```bash
git checkout -b test/verify-ruleset
echo "test" > verify-ruleset.txt
git add verify-ruleset.txt
git commit -m "test: verify ruleset enforcement"
git push origin test/verify-ruleset
gh pr create --title "Test ruleset" --body "Verify rules are enforced. Close without merging."
```

Confirm the PR shows required checks and review requirements. Then close the PR:

```bash
gh pr close test/verify-ruleset --delete-branch
```

---

## Fallback: No API Permissions

If the agent (or the user running the agent) does not have admin permissions to create rulesets via API, there are two fallback options.

### Option A: Output the command for manual execution

Print the full `gh api` command and ask an admin to run it:

```
I need admin permissions to create branch rulesets for this repository.

Please run the following command (or ask a repository admin to run it):

cat <<'RULESET_JSON' | gh api repos/{owner}/{repo}/rulesets --method POST --input -
{
  "name": "Protect main",
  "target": "branch",
  "enforcement": "active",
  ...full payload...
}
RULESET_JSON
```

### Option B: Direct to GitHub web UI

If the command-line approach is not feasible:

1. Go to **Settings > Rules > Rulesets** in the repository
2. Click **New ruleset > New branch ruleset**
3. Set name to "Protect main"
4. Under **Target branches**, add `main`
5. Enable the following rules:
   - Restrict deletions
   - Require a pull request before merging (1 approval, dismiss stale approvals)
   - Require status checks to pass (add your CI check name)
   - Block force pushes
6. Set enforcement to **Active**
7. Click **Create**

---

## Quick Reference

| Task | Command |
|------|---------|
| List rulesets | `gh api repos/{owner}/{repo}/rulesets` |
| Get ruleset details | `gh api repos/{owner}/{repo}/rulesets/{id}` |
| Create ruleset | `cat payload.json \| gh api repos/{owner}/{repo}/rulesets --method POST --input -` |
| Update enforcement | `echo '{"enforcement":"active"}' \| gh api repos/{owner}/{repo}/rulesets/{id} --method PUT --input -` |
| Delete ruleset | `gh api repos/{owner}/{repo}/rulesets/{id} --method DELETE` |
| List org rulesets | `gh api orgs/{org}/rulesets` |
