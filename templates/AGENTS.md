# Agent instructions for {{PROJECT_NAME}}

This is a starter for repository-specific instructions, not evidence that setup,
checks or deployment work. Before changing code, replace assumptions with facts
from this repository and keep this file short. Preserve existing owner rules.

## Discover the project

Read the nearest applicable instructions and repository documentation. Inspect
language manifests, lockfiles, task scripts and CI before choosing commands.
Do not assume Node, npm, a test framework or a test-directory convention.

Record the project's purpose, supported runtimes, source/test locations and
subsystem references here as they are confirmed. For a monorepo, read the local
instructions and manifests of the package being changed as well as the root.

## Setup and checks

Discover and record the exact non-interactive commands for dependency setup,
building, tests, lint/type checks and the changed user path. Prefer repository
scripts and the existing lockfile. Run in an isolated environment; never use real
credentials or live user configuration in unit tests.

Keep verification commands separate from formatters or generators that write
files. A command called "check" may omit tests; inspect what it actually runs.
Name the runtime/platform and required services. If a command or prerequisite is
unavailable, record the missing evidence instead of inventing a passing result.
Do not add dependencies or change CI merely to make this starter look complete.

## Development loop

1. Fetch and record the base commit, inspect local changes and parallel PRs or
   worktrees, and work in an owned branch without altering another lane's state.
2. State the expected user result. Reproduce the reported input through the
   actual entrypoint before fixing a bug; check related callers and sibling paths.
3. Make the smallest relevant change. For bug fixes, show a regression fails
   against the original behavior and passes with the fix. Collection/build errors
   and skipped tests are not proof of a behavioral regression. Documentation
   changes need accurate commands and links rather than ceremonial new tests.
4. Execute the applicable checks and inspect their actual output and exit status.
   Investigate failures; a pre-existing red needs its fetched SHA, output and
   tracked follow-up. A retry that eventually passes does not explain a failure.
5. Obtain independent review on the exact commit, resolve findings and reverify
   changed content. Simplify unnecessary code before delivery. A new commit
   invalidates an earlier review of the changed content.
6. Record commands, results, commit SHA, review verdict, skipped checks and their
   remaining owner in the PR or task receipt. Promote recurring confirmed bugs
   into targeted tests or review rules instead of growing a generic policy list.

## Acceptance and boundaries

Tests, independent review, merge, release, deployment and live acceptance are
separate states. A generated file or readiness score proves none of them. Match
claims to the check actually run; test the installed/built entrypoint when the
change affects packaging, CLI or integration behavior.

Retain existing approval requirements for dependency changes, CI, merges,
publishing, deployments and destructive operations. Prepare a reviewable result
and an async decision card for gated actions; ordinary work runs headlessly.
Never commit or print secrets. Preserve user data and configuration.

## Close the attempt

Save unpushed work and useful evidence before ending an attempt. Clean only
scratch and resources created by this run. Record exact created resource IDs;
never delete from a shared listing. Report any cleanup failure and the remaining
verification or approval gate honestly.
