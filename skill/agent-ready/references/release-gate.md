# Release Gate Reference

A verification layer above tests that answers "does the product still work for its users?" before merge.

---

## Why a Release Gate

Unit, integration, behavior-driven (BDT), and E2E tests verify that code behaves as written. A release gate asks a different question: does the product still work for the people who use it?

- Tests check what authors **anticipated**. Release missions check what users **actually do**.
- A green suite can still ship a broken product: every test passes while the signup flow, the export button, or the admin console is dead.
- Diff-aware scrutiny: a docs typo does not deserve the same verification as an auth change. The gate scales depth to risk.

**Principle:** Tests prove the code does what you wrote. The release gate proves the product still does what users need.

---

## Risk Classification From the Diff

Classify every change before deciding how deep to verify. The diff itself carries the signal.

| Diff Signal | Risk Tier | Verification Depth |
|-------------|-----------|-------------------|
| Docs, comments, test-only changes | T0 — trivial | Deterministic lane only; no missions |
| Dependency bump (patch/minor) | T1 — low | Deterministic lane + smoke mission |
| Internal refactor (no API/behavior change) | T1 — low | Deterministic lane + 1–2 missions on touched paths |
| Public API change (endpoints, exported functions, CLI flags) | T2 — medium | Deterministic lane + missions covering affected personas |
| Auth, payments, data model, migrations | T3 — critical | Deterministic lane + full mission pack + manual sign-off |

Rules:

- Classify by the **highest** tier any file in the diff triggers.
- When in doubt, classify up. A missed T3 is far more expensive than an extra T2 run.
- Keep the classifier deterministic — path globs and dependency-file diffs, not vibes.

---

## The Critical Mission Pack

A mission is a bounded, user-shaped verification task:

```
Mission: export-report
  Persona:    power user
  Start:      logged in, project with ≥1 saved report exists
  Action:     open report → click "Export CSV" → download completes
  Oracle:     HTTP 200 on /export, response Content-Type: text/csv,
              file parses with expected header row
  Evidence:   network trace, downloaded file, timestamps
  Time bound: 90 seconds
  Verdict:    pass | fail | blocked
```

Guidelines:

- **Small pack**: ~5–15 missions total. Cover critical paths only — signup, login, core create/read/update, payment, export, admin actions. If everything is critical, nothing is.
- **Personas**: new user, returning/power user, admin, API consumer. Each mission names exactly one.
- **Bounded**: every mission has a start state, a single action chain, an oracle, and a hard time budget. Missions that wander are tests, not gates.
- **Runnable**: missions execute against a real environment (preview deploy, staging, ephemeral container) — never against mocked-out stubs.

---

## Two Lanes: Deterministic + Advisory

Keep two verification lanes, and never mix them.

| Lane | Contents | Blocking? |
|------|----------|-----------|
| Deterministic | lint, typecheck, unit tests, build | Yes — always |
| Mission | risk-tiered mission pack against a live environment | Only on `block` — see Three-Way Verdict |

- The deterministic lane stays exactly as strict as it already is. The mission layer does not replace it, weaken it, or gate it.
- The mission lane blocks only on evidenced failure of a critical mission. Every other outcome is advisory and informs a human merge decision — a `ship` is never an auto-approval.
- One report artifact covers both lanes so reviewers see a single page.

---

## Oracles and Evidence

Every mission needs an explicit oracle and captured evidence. Receipts, not vibes.

### Oracles

An oracle is an observable, checkable fact:

- HTTP status code and response shape
- DOM element present/visible (selector, not "the page looks right")
- Database row exists with expected fields
- Log line emitted matching a pattern
- Process exit code

If a mission has no oracle, it is not a mission — it is a demo.

### Evidence

Every verdict must carry a pointer to evidence:

- Screenshots or screen recordings
- Captured logs and network traces
- Timestamps (start/end/duration)
- Artifact links (uploaded files, CI artifact URLs)

A `pass` without evidence is indistinguishable from a guess. A `fail` without evidence is not actionable.

---

## Three-Way Verdict

The mission lane emits one of three verdicts per change:

| Verdict | Meaning | CI Mapping |
|---------|---------|------------|
| `block` | A critical mission failed with evidence | Failing check — merge is blocked |
| `ship` | All required missions passed with evidence | Green check + attached evidence report |
| `investigate` | Missions inconclusive, flaky env, or partial coverage | **Non-blocking** — PR comment, report artifact, or warning annotation. Must NOT fail the build. |

Roll per-mission results up to the change verdict:

| Per-mission results | Change verdict |
|---------------------|----------------|
| Any critical mission `fail` with evidence | `block` |
| Any mission `blocked` (environment down, timeout), or a non-critical `fail`, or a required mission not run | `investigate` |
| Every required mission `pass` with evidence | `ship` |

The `investigate` verdict exists because the mission layer runs against real environments, which flake. Flakiness is a signal for a human, not a red X for the pipeline. Never let `investigate` fail the build — that trains teams to ignore or delete the gate. Reserve the red check for `block`, where the evidence shows a real failure.

---

## One Command: `release:ready`

Expose the whole gate as a single command:

```jsonc
// package.json
{
  "scripts": {
    "release:ready": "node scripts/release-ready.mjs"
  }
}
```

```make
# or Makefile
release-ready:
	./scripts/release-ready.sh
```

The command must:

1. Run the deterministic lane (lint, typecheck, unit tests, build).
2. Classify the diff into a risk tier.
3. Run the mission pack appropriate to that tier.
4. Emit **one** report artifact — per-mission verdicts, oracles, evidence links, timestamps, and the overall advisory.

```text
release-report-20260924_143012/
├── report.md            # summary table + overall verdict
├── missions/
│   ├── export-report/   # evidence per mission
│   └── signup-flow/
└── deterministic.log    # lane output
```

Reviewers read one report. The gate either ran or it didn't — no partial invocations spread across five commands.

---

## Common Mistakes

### 1. False-green scripts

```bash
# BAD: gate script that can never fail
node scripts/run-missions.mjs || true
echo "gate passed"
exit 0
```

If the gate script always exits 0, it provides zero signal. Worse, it provides *negative* signal — a green badge hiding a broken product. Same class of failure: "checks" that can't fail, and evidence that is just an agent's written claim with no artifacts.

### 2. Advisory treated as approval

The mission verdict **informs** a human/owner merge decision. It is never an auto-approval, and it never auto-merges. An agent reading "all missions passed" may report readiness — the merge decision stays with the owner.

### 3. Mission pack bloat

A 60-mission pack means nobody reads the report and the lane takes hours. Keep it ~5–15 missions on critical paths only. When a mission hasn't failed or caught anything in months, demote it to the regular test suite.

### 4. Nondeterministic oracles

"The page looks correct" is not an oracle. Neither is an LLM's unstructured opinion of a screenshot. Oracles must be machine-checkable: status codes, selectors, row counts, log patterns, exit codes.

### 5. Running the mission layer on every trivial diff

A README typo does not need a 15-mission run against staging. Respect the risk tiers — running the full pack on T0 diffs burns time and teaches people to route around the gate.

---

## Quick Checklist

- [ ] Risk classifier maps diff signals to tiers (T0–T3) deterministically
- [ ] Mission pack is ~5–15 bounded missions covering critical paths only
- [ ] Every mission defines: persona, start state, action, oracle, evidence, time bound
- [ ] Every oracle is machine-checkable (status, DOM, DB row, log, exit code)
- [ ] Every verdict carries an evidence pointer (screenshots, logs, traces, links)
- [ ] Deterministic lane (lint/typecheck/test/build) stays blocking and separate
- [ ] `block` fails the check; `ship` is green with evidence; `investigate` never fails the build
- [ ] One command (`release:ready`) runs both lanes and emits one report artifact
- [ ] No gate script can exit 0 unconditionally
- [ ] Advisory output informs a human merge decision — never auto-approves
