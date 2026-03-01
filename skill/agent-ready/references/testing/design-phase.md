# Part II: Design Phase

## 5. Test Case Design

### 5.1 Design Techniques

#### Equivalence Partitioning
Divide inputs into classes where all values should behave identically.

| Input Domain | Invalid Low | Valid | Invalid High |
|--------------|-------------|-------|--------------|
| Age (0-150) | <0 | 0-150 | >150 |
| **Test values** | -1 | 25 | 200 |

#### Boundary Value Analysis
Test at boundaries of equivalence classes.

| Boundary | Values to Test |
|----------|----------------|
| Min-1, Min, Min+1 | -1, 0, 1 |
| Max-1, Max, Max+1 | 149, 150, 151 |

#### Decision Table Testing
For complex rules with multiple conditions.

| C1 | C2 | C3 | Action |
|:--:|:--:|:--:|--------|
| T | T | T | A |
| T | T | F | B |
| T | F | * | C |
| F | * | * | D |

### 5.2 Test Case Template

```markdown
## Test Case: TC-XXX

**Title:** [Descriptive title]
**Priority:** P0/P1/P2
**Type:** Unit/Integration/E2E

### Preconditions
- Condition 1
- Condition 2

### Test Data
| Parameter | Value |
|-----------|-------|
| input1 | value1 |

### Steps
1. Action 1
2. Action 2

### Expected Results
- Result 1
- Result 2

### Related Branches
B01, B02, B03
```

---

## 6. Impact Analysis

**New code must NOT break existing behavior.**

### 6.1 Impact Matrix

| Feature | Before | After | Impact | Verification |
|---------|--------|-------|:------:|--------------|
| Feature A | Behavior X | Behavior X | ✅ None | Regression |
| Feature B | Behavior Y | Behavior Y' | ⚠️ Changed | Document |
| Feature C | Supported | Removed | ❌ Breaking | Migration |
| Feature D | N/A | New | 🆕 New | New tests |

### 6.2 Impact Categories

| Symbol | Meaning | Required Action |
|:------:|---------|-----------------|
| ✅ | No impact | Regression test confirms |
| ⚠️ | Changed | Document, communicate, test |
| ❌ | Breaking | Migration plan required |
| 🆕 | New feature | New test coverage |
| 🔄 | Refactored | Verify unchanged behavior |

### 6.3 Known Issues Tracking

| ID | Description | Severity | Status |
|----|-------------|:--------:|:------:|
| KI-01 | Description | 🟡 Medium | Open |
| KI-02 | Description | 🟢 Low | Deferred |

Severity: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## 7. Test Prioritization

### 7.1 Priority Framework

| Priority | Criteria | When to Run |
|:--------:|----------|-------------|
| **P0** | Core functionality, security, data integrity | Every commit |
| **P1** | Important features, common paths | Every PR |
| **P2** | Edge cases, rare scenarios | Before release |
| **P3** | Nice-to-have, cosmetic | Periodic |

### 7.2 Priority Assignment

| Factor | P0 | P1 | P2 |
|--------|:--:|:--:|:--:|
| **Impact** | Blocking | Major | Minor |
| **Frequency** | Every user | Most users | Some users |
| **Data Risk** | Loss | Incorrect | Incomplete |
| **Security** | Vulnerability | Weakness | Hardening |
