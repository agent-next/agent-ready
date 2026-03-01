# Branch Matrices

Complete branch coverage templates for systematic testing. Copy and customize for your project.

## Entry Point Branches

| ID | Condition | Scenario | Expected | Priority |
|----|-----------|----------|----------|:--------:|
| E01 | No input | Empty state | Placeholder | P0 |
| E02 | Valid input A | Primary flow | Process A | P0 |
| E03 | Valid input B | Secondary flow | Process B | P1 |
| E04 | Invalid input | Error case | Reject | P0 |

## Authentication Branches

| ID | Auth State | User State | Expected | Priority |
|----|:----------:|:----------:|----------|:--------:|
| A01 | Complete | Authenticated | Proceed | P0 |
| A02 | Complete | Unauthenticated | Login redirect | P0 |
| A03 | Loading | Any | Show loading | P1 |
| A04 | Complete | Session expired | Re-authenticate | P1 |

## Authorization Branches

| ID | Resource | Permission | Expected | Priority |
|----|:--------:|:----------:|----------|:--------:|
| Z01 | Exists | Allowed | Access granted | P0 |
| Z02 | Exists | Denied | 403 Forbidden | P0 |
| Z03 | Not found | Any | 404 Not found | P0 |

## Business Logic Branches

| ID | Condition | Scenario | Expected | Priority |
|----|-----------|----------|----------|:--------:|
| L01 | quota >= required | Sufficient | Proceed | P0 |
| L02 | quota < required | Insufficient | Reject | P0 |
| L03 | quota == required | Boundary | Proceed | P1 |
| L04 | quota == required - 1 | Boundary | Reject | P1 |
| L05 | unlimited | Bypass | Skip check | P0 |

## API Response Branches

| ID | Response | Scenario | Expected | Priority |
|----|----------|----------|----------|:--------:|
| X01 | 200 + data | Success | Process | P0 |
| X02 | 200 + empty | Empty result | Handle empty | P0 |
| X03 | 200 + null field | Partial | Handle missing | P1 |
| X04 | 400 | Bad request | Validation error | P0 |
| X05 | 401 | Unauthorized | Re-auth | P0 |
| X06 | 403 | Forbidden | Permission error | P0 |
| X07 | 404 | Not found | Not found handling | P0 |
| X08 | 429 | Rate limited | Retry message | P1 |
| X09 | 500 | Server error | Error + retry | P0 |
| X10 | Network error | No connection | Offline message | P0 |
| X11 | Timeout | Slow response | Timeout + retry | P1 |

## Input Validation Branches

| ID | Input | Scenario | Expected | Priority |
|----|-------|----------|----------|:--------:|
| V01 | null | Null value | Reject/default | P0 |
| V02 | undefined | Undefined | Reject/default | P0 |
| V03 | "" | Empty string | Reject | P0 |
| V04 | "   " | Whitespace | Reject (trim) | P0 |
| V05 | valid min | Minimum valid | Accept | P0 |
| V06 | valid max | Maximum valid | Accept | P1 |
| V07 | too long | Exceeds max | Reject/truncate | P1 |
| V08 | special chars | XSS attempt | Sanitize | P0 |
| V09 | unicode | 中文/emoji | Handle correctly | P1 |

## Callback Branches

| ID | Callback | Condition | Expected | Priority |
|----|----------|-----------|----------|:--------:|
| C01 | onSuccess | Normal | Update state | P0 |
| C02 | onError | Failed | Show error | P0 |
| C03 | onProgress | First | Initialize | P1 |
| C04 | onProgress | Update | Update progress | P1 |
| C05 | onCancel | Cancelled | Clean up | P1 |

## Error Handling Branches

| ID | Error Type | Expected Message | Priority |
|----|------------|------------------|:--------:|
| M01 | Error with message | error.message | P0 |
| M02 | Error no message | Default message | P1 |
| M03 | String thrown | String or default | P1 |
| M04 | null/undefined | Default message | P1 |

---

## Usage Instructions

1. **Copy relevant tables** to your test plan
2. **Add project-specific branches** as needed
3. **Mark status** as you implement tests:
   - ⬜ Pending
   - ✅ Passed
   - ❌ Failed
   - ⏭️ Skipped (with reason)
4. **Track completion** in your PR description

## Branch Matrix Completion Template

```markdown
| Category | Total | Covered | Pending |
|----------|:-----:|:-------:|:-------:|
| Entry Points | 4 | 4 | 0 |
| Auth | 4 | 3 | 1 |
| API | 11 | 9 | 2 |
| Validation | 9 | 9 | 0 |
| **Total** | **28** | **25** | **3** |
```
