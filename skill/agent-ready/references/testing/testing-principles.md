# Part IV: Testing Principles

Deep insights on test methodology, mock vs real testing, and creating test conditions.

---

## Test Context

**Every test must define its context (preconditions) explicitly.**

### Context Hierarchy

```
Global Context (entire test suite)
    └── Feature Context (feature-level)
        └── Scenario Context (scenario-level)
            └── Step Context (step-level)
```

### Context Matrix

| Test ID | Auth | Role | Resource | Network | Expected |
|---------|:----:|:----:|:--------:|:-------:|----------|
| T01 | ✅ | Admin | Exists | OK | Success |
| T02 | ✅ | User | Exists | OK | Success |
| T03 | ❌ | - | - | OK | Auth error |
| T04 | ✅ | User | Missing | OK | 404 |
| T05 | ✅ | User | Exists | Offline | Network error |

### Context Naming Convention

```
{Entry}_{Auth}_{Permission}_{Data}_{Network}

Examples:
E01_A01_Z01_D01_N01 = Valid input + Auth OK + Permitted + Data exists + Network OK
E01_A02_*_*_*       = Valid input + Not authenticated (rest irrelevant)
E02_A01_Z01_D02_N01 = Secondary input + Auth OK + Permitted + Data empty + Network OK
```

### Handling Combinatorial Explosion

Not all combinations need testing. Use this priority:

```markdown
## P0 Combinations (Must test all)
- Happy path complete context
- Each independent condition's false branch

## P1 Combinations (Selective)
- Common combinations
- Business-critical combinations

## P2 Combinations (Boundary only)
- Extreme combinations
- Rare but possible combinations

## Skip
- Logically impossible (e.g., Not authenticated + Premium user)
- Already covered by other tests implicitly
```

### Context Setup Best Practice

```typescript
// ✅ Good: Explicit context setup
describe('Feature: Upload Processing', () => {
  describe('Context: Authenticated, Premium user, Network OK', () => {
    beforeEach(() => {
      setupAuth({ authenticated: true });    // Auth context
      setupUser({ type: 'premium' });        // User context
      setupNetwork({ status: 'online' });    // Network context
      setupAPI({ response: 'success' });     // API context
    });

    test('should process without credit deduction', () => {
      // Test with explicit context
    });
  });

  describe('Context: Authenticated, Free user, Insufficient credits', () => {
    beforeEach(() => {
      setupAuth({ authenticated: true });
      setupUser({ type: 'free' });
      setupCredits({ amount: 5 });  // < 10 required
    });

    test('should show insufficient credits error', () => {
      // Test with explicit context
    });
  });
});

// ❌ Bad: Implicit context
describe('Upload', () => {
  test('should work', () => {
    // What's the auth state? Credits? Network?
    // Context is unclear - test is unreliable
  });
});
```

---

## Core Insights

### 1. Correct Code ≠ Correct Behavior

```javascript
// Code is "correct":
if (!text) throw new Error('Required');

// Behavior is wrong:
text = '   ';  // Whitespace is truthy!
// Empty content accepted ❌

// Fix: Test behavior, not code
if (!text?.trim()) throw new Error('Required');
```

**Lesson:** Always test what users see, not what code does.

### 2. Multiple Entry Points, Same Behavior

```
User Path A: Homepage → Upload → Feature
User Path B: Direct URL → Feature

Both paths MUST produce identical behavior!
```

Test both paths and compare results.

### 3. Refactoring Preserves Behavior

| Behavior | Before | After | Test |
|----------|--------|-------|:----:|
| Success message | "Done" | "Done" | ✅ |
| Error message | "Failed" | "Failed" | ✅ |
| Loading state | Spinner | Spinner | ✅ |

Refactor = Change structure, NOT behavior.

### 4. Error Paths = 50% of Code

```
Code Distribution:
├── Happy Path      ~30%
├── Error Handling  ~40%
├── Edge Cases      ~20%
└── Validation      ~10%

Test coverage SHOULD match this distribution!
```

### 5. "Empty" Has Many Forms

```javascript
// All "empty" but JavaScript treats differently:
null          // typeof === 'object' 😱
undefined     // typeof === 'undefined'
''            // empty string, falsy
'   '         // whitespace, TRUTHY! 🚨
[]            // empty array, TRUTHY!
{}            // empty object, TRUTHY!
0             // number zero, falsy
false         // boolean false
NaN           // Not a Number, falsy
```

**Test each variation explicitly.**

### 6. UI is a State Machine

```
Wrong thinking: "Call function → Get result"
Right thinking: "State A + Event → State B + Side effects"
```

State machine questions to answer:
- What happens clicking during Loading?
- What happens retrying from Error?
- What happens with rapid clicks?

### 7. Users Don't Follow Happy Paths

**Your expected flow:**
```
1. User uploads file
2. Wait for preview
3. Click Submit
4. Wait for completion
```

**Actual user behavior:**
```
1. User uploads file
2. Immediately clicks Submit (no preview yet)
3. Double-clicks Submit (afraid first didn't work)
4. Sees Loading, clicks again
5. Refreshes page mid-process
6. Returns and expects to continue
```

**Test these chaotic scenarios!**

```typescript
describe('Chaos testing', () => {
  test('double-click should not duplicate', async () => {
    await userEvent.dblClick(submitButton);
    expect(apiCall).toHaveBeenCalledTimes(1);
  });

  test('click during loading is ignored', async () => {
    await userEvent.click(submitButton);
    // Now loading
    await userEvent.click(submitButton);
    expect(apiCall).toHaveBeenCalledTimes(1);
  });

  test('refresh preserves state', async () => {
    // Start operation
    await userEvent.click(submitButton);
    // Refresh
    await page.reload();
    // Should recover or show appropriate state
    expect(screen.getByText(/progress|resume/i)).toBeVisible();
  });
});
```

---

## Mock vs Real Testing

**Mocks are tools, not destinations. Final validation MUST use real environment.**

### Testing Pyramid

```
                    ▲
                   /│\         E2E Tests (Real environment)
                  / │ \        - Fewest tests
                 /  │  \       - Highest confidence
                /   │   \      - Slowest execution
               /────┼────\
              /     │     \    Integration Tests (Partial mock)
             /      │      \   - Moderate quantity
            /       │       \  - Medium confidence
           /────────┼────────\
          /         │         \ Unit Tests (Full mock)
         /          │          \- Most tests
        /           │           \- Lowest confidence
       /────────────┴────────────\- Fastest execution
```

### Mock vs Real Comparison

| Test Type | Mock Level | Speed | Confidence | Purpose |
|-----------|:----------:|:-----:|:----------:|---------|
| **Unit** | 100% Mock | ⚡ ms | 🟡 Low | Logic correctness |
| **Integration** | 50% Mock | 🔄 sec | 🟠 Medium | Component interaction |
| **E2E** | 0% Mock | 🐢 min | 🟢 High | User experience |
| **Production** | Real | - | ✅ Highest | Final validation |

### Problems with Mocks

```typescript
// Unit test with mocks - PASSES ✅
test('OCR flow works', () => {
  mockFileReader.mockResolvedValue('base64...');
  mockOCR.mockResolvedValue({ text: 'x=1' });
  mockAPI.mockResolvedValue({ taskId: '123' });

  // Test passes! But in production...
});

// Production reality - FAILS ❌
// - FileReader fails on large files
// - OCR times out on slow network
// - API returns different format
// - None of these tested!
```

**Mock tests prove logic is correct. Real tests prove it works.**

### Required Real Environment Tests

```markdown
## Must Test with Real Environment (Before Release)

### Network
- [ ] Real API calls (not mock responses)
- [ ] Real network latency
- [ ] Real timeout scenarios
- [ ] Real error responses (500, 503)

### Files
- [ ] Real file uploads (not mock File)
- [ ] Different file sizes
- [ ] Different file formats
- [ ] Corrupted files

### Authentication
- [ ] Real login flow
- [ ] Real session expiry
- [ ] Real permission checks

### State
- [ ] Real localStorage/sessionStorage
- [ ] Real browser back/forward
- [ ] Real page refresh
```

### When to Mock vs When Not

**✅ Good to Mock:**
- External APIs (third-party services)
- Random/time-dependent values
- Expensive operations (emails, payments)
- Hard-to-trigger edge cases

**❌ Don't Mock:**
- Core business logic
- Internal component interaction
- Database query logic
- User-visible behavior

### Progressive Testing Strategy (Day 1-4)

```markdown
### Day 1: Quick Verification (Full Mock)
Goal: Confirm logic correctness fast
- Unit tests with mocks
- Run time: seconds

### Day 2: Component Integration (Partial Mock)
Goal: Verify component collaboration
- Integration tests
- Mock external APIs only
- Run time: minutes

### Day 3: End-to-End (No Mock)
Goal: Verify user experience
- E2E tests on staging
- Real APIs, real data
- Run time: 10+ minutes

### Day 4: Production Validation
Goal: Final confirmation
- Smoke tests on production
- Monitor error rates
- Watch user feedback
```

### Final Checklist Before Release

```markdown
## Mock Tests (CI - every commit)
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Coverage thresholds met

## Real Tests (Before release - required)
- [ ] E2E tests pass on staging
- [ ] Manual smoke test on staging
- [ ] Core paths verified in real environment

## Production Validation (After deploy)
- [ ] Production smoke test passes
- [ ] Error rate monitoring normal
- [ ] User feedback monitored
```

---

## Creating Real Test Conditions

**核心原则: 用户不是测试人员。上线前必须覆盖真实条件，没有条件就创造条件。**

### Why This Matters

```
❌ Wrong: "Ship it, users will find bugs"
✅ Right: "Simulate EVERY user scenario before shipping"
```

### Test Environment Requirements

```markdown
## Staging Environment Checklist

### Infrastructure (must match production)
- [ ] Same cloud provider / region
- [ ] Same database version
- [ ] Same cache configuration
- [ ] Same CDN setup
- [ ] Same authentication system

### Data (must be realistic)
- [ ] Real-world data volumes
- [ ] Edge case data seeded
- [ ] Multiple user types created
- [ ] Various subscription levels
- [ ] International data (unicode, timezones)

### Configuration (must match production)
- [ ] Same feature flags
- [ ] Same rate limits
- [ ] Same timeout values
- [ ] Same error thresholds
```

### Creating Test Conditions You Don't Have

#### 1. Network Conditions

```typescript
// Simulate slow network
await page.route('**/*', route => {
  setTimeout(() => route.continue(), 3000); // 3 second delay
});

// Simulate network failure
await page.route('**/api/**', route => {
  route.abort('failed');
});

// Simulate timeout
await page.route('**/api/**', route => {
  // Never respond = timeout
});

// Simulate intermittent failures (flaky network)
let requestCount = 0;
await page.route('**/api/**', route => {
  requestCount++;
  if (requestCount % 3 === 0) {
    route.abort('failed'); // Fail every 3rd request
  } else {
    route.continue();
  }
});
```

#### 2. User States

```typescript
// Create test users with specific states
const testUsers = {
  newUser: { credits: 10, premium: false, verified: false },
  freeUser: { credits: 100, premium: false, verified: true },
  premiumUser: { credits: 0, premium: true, verified: true },
  lowCredits: { credits: 1, premium: false, verified: true },
  expiredSession: { credits: 100, sessionExpiry: 'past' },
  suspendedUser: { credits: 100, status: 'suspended' },
};

// Seed database before tests
beforeAll(async () => {
  for (const [name, data] of Object.entries(testUsers)) {
    await db.users.create({ email: `${name}@test.com`, ...data });
  }
});
```

#### 3. Edge Case Data

```typescript
// Seed edge case data
const edgeCaseData = {
  // Empty states
  emptyResult: { items: [] },
  nullFields: { name: null, email: null },

  // Boundary values
  maxLength: { name: 'a'.repeat(255) },
  minValue: { amount: 0 },
  maxValue: { amount: Number.MAX_SAFE_INTEGER },

  // Special characters
  unicode: { name: '中文测试 🎉 émoji' },
  xssAttempt: { name: '<script>alert("xss")</script>' },
  sqlInjection: { name: "'; DROP TABLE users; --" },

  // Large data
  manyItems: { items: Array(1000).fill({ id: 'item' }) },
  largeText: { content: 'x'.repeat(100000) },
};
```

#### 4. Time-Based Conditions

```typescript
// Test session expiry
test('expired session redirects to login', async () => {
  // Fast-forward time
  vi.useFakeTimers();

  await login();

  // Advance 24 hours (session expiry)
  vi.advanceTimersByTime(24 * 60 * 60 * 1000);

  await page.click('button');

  expect(page.url()).toContain('/login');
});

// Test rate limiting
test('rate limit after too many requests', async () => {
  for (let i = 0; i < 100; i++) {
    await api.request();
  }

  const response = await api.request();
  expect(response.status).toBe(429);
  expect(response.body).toContain('rate limit');
});
```

#### 5. Concurrent Conditions

```typescript
// Test race conditions
test('double-click does not duplicate', async () => {
  const submitButton = screen.getByRole('button', { name: /submit/i });

  // Simulate rapid clicks
  await Promise.all([
    userEvent.click(submitButton),
    userEvent.click(submitButton),
    userEvent.click(submitButton),
  ]);

  // Should only process once
  expect(mockAPI).toHaveBeenCalledTimes(1);
});

// Test concurrent API calls
test('concurrent requests handled correctly', async () => {
  const results = await Promise.all([
    api.createItem({ name: 'A' }),
    api.createItem({ name: 'B' }),
    api.createItem({ name: 'C' }),
  ]);

  // All should succeed, no conflicts
  results.forEach(r => expect(r.status).toBe(201));

  // Items should be distinct
  const ids = results.map(r => r.body.id);
  expect(new Set(ids).size).toBe(3);
});
```

#### 6. File Conditions

```typescript
// Create test files programmatically
const testFiles = {
  validImage: () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        resolve(new File([blob], 'test.png', { type: 'image/png' }));
      });
    });
  },

  largeFile: () => {
    const size = 10 * 1024 * 1024; // 10MB
    const buffer = new ArrayBuffer(size);
    return new File([buffer], 'large.bin', { type: 'application/octet-stream' });
  },

  corruptedFile: () => {
    return new File(['not valid image data'], 'corrupt.png', { type: 'image/png' });
  },

  emptyFile: () => {
    return new File([], 'empty.txt', { type: 'text/plain' });
  },
};
```

---

## Complete Pre-Release Test Matrix

```markdown
## Mandatory Test Scenarios Before Release

### Happy Paths (P0)
- [ ] New user signup → first action → success
- [ ] Existing user login → primary feature → success
- [ ] Premium user → premium feature → success
- [ ] Complete flow A → B → C → D → success

### Authentication Scenarios (P0)
- [ ] Valid login
- [ ] Invalid credentials → error message
- [ ] Session expiry → re-auth prompt
- [ ] Logout → redirect to login
- [ ] Concurrent sessions (if applicable)

### Authorization Scenarios (P0)
- [ ] Permitted action → success
- [ ] Denied action → 403 error
- [ ] Resource not found → 404 error
- [ ] Exceed quota → limit message

### Input Validation (P0)
- [ ] Empty input → validation error
- [ ] Whitespace only → validation error
- [ ] Valid minimum → accepted
- [ ] Valid maximum → accepted
- [ ] Over maximum → rejected/truncated
- [ ] Special characters → sanitized
- [ ] Unicode/emoji → handled correctly

### Network Conditions (P1)
- [ ] Normal latency → success
- [ ] High latency (3s) → loading state
- [ ] Timeout (30s) → timeout error
- [ ] Network failure → error + retry option
- [ ] Intermittent failure → graceful degradation

### Error Recovery (P1)
- [ ] API error → error message + retry
- [ ] Validation error → fix and retry
- [ ] Partial failure → rollback or resume
- [ ] Crash recovery → state restored

### Edge Cases (P1)
- [ ] First item (no previous)
- [ ] Last item (no next)
- [ ] Only one item
- [ ] Zero items (empty state)
- [ ] Maximum items (pagination)
- [ ] Deleted item access → 404

### Chaos Testing (P1)
- [ ] Double-click → single action
- [ ] Rapid navigation → no race condition
- [ ] Refresh mid-action → state preserved or graceful restart
- [ ] Back button → expected behavior
- [ ] Multiple tabs → no conflict
```

---

## Edge Case Categories

| Category | Examples | Priority |
|----------|----------|:--------:|
| Empty/Null | null, undefined, "", [], {} | P0 |
| Whitespace | " ", "\t", "\n" | P0 |
| Boundary | 0, -1, MAX, MIN | P1 |
| Unicode | emoji, CJK, RTL | P1 |
| Malformed | Invalid JSON, corrupt | P1 |
| Injection | XSS, SQL injection | P0 |
| Concurrent | Race conditions | P1 |
| Network | Offline, timeout | P1 |

---

## Red Flags

| Thought | Action |
|---------|--------|
| "Won't trigger" | Test it |
| "Old code handles it" | Verify it |
| "Edge case unlikely" | Test it |
| "Tested manually" | Automate it |
| "Works locally" | Test staging |
| "Skip this one" | That's the bug |

---

## Common Mistakes

| Mistake | Why It's Bad | Fix |
|---------|--------------|-----|
| Only happy path | Error paths are 50% of code | Test ALL branches |
| Assume old works | Changes can affect old features | Regression tests |
| Skip null tests | Most common production bugs | Test all empty types |
| Mock everything | Mocks hide real problems | Integration + E2E tests |
| Test implementation | Refactoring breaks tests | Test user-visible behavior |
| "Tested manually" | Not repeatable | Automate it |
| Skip loading state | Users interact during load | Test loading behavior |
| Ignore double-click | Users double-click everything | Test rapid interactions |
| No error message tests | Users see wrong errors | Assert exact messages |

---

## Rollback Plan

**Always have a rollback plan before deploying.**

### Trigger Conditions

- Error rate > 1%
- Core functionality broken
- Significant user complaints
- Data corruption detected

### Rollback Methods

#### Method 1: Revert Commits (Recommended)

```bash
# 1. Create revert commit
git revert <commit-hash>

# 2. Push to main
git push origin main

# 3. Wait for CI/CD deployment

# 4. Verify rollback successful
```

#### Method 2: Reset Branch (Emergency Only)

```bash
# 1. Find safe commit
git log --oneline -10

# 2. Reset to safe point
git reset --hard <safe-commit>

# 3. Force push (DANGEROUS!)
git push origin main --force

# 4. Notify team immediately
```

### Post-Rollback Actions

1. Create incident report
2. Analyze root cause
3. Add missing tests that would have caught it
4. Fix and re-deploy with better coverage

---

## Deliverables Checklist

### Documentation
- [ ] Requirements defined
- [ ] Changes tracked
- [ ] State machine documented
- [ ] Branch matrix complete
- [ ] Impact analysis done

### Coverage
- [ ] P0 branches tested
- [ ] P1 branches tested
- [ ] Edge cases covered
- [ ] Error paths tested

### Execution
- [ ] All tests passing
- [ ] Coverage met
- [ ] CI green
- [ ] Staging verified

---

## Quick Reference

| Phase | Output | Time |
|-------|--------|:----:|
| Requirements | Gherkin specs | 15-30m |
| Code Tracking | Change log | 10-15m |
| State Analysis | State diagram | 15-30m |
| Branch Mapping | Branch matrix | 30-60m |
| Test Design | Test cases | 30-60m |
| Impact Analysis | Impact matrix | 15-30m |
| Implementation | Test code | 60-120m |
| Execution | Results | 15-30m |

**Total: 3-6 hours** (varies by complexity)
