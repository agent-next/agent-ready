# Part III: Execution Phase

## 8. Test Data Preparation

### 8.1 Fixture Organization

```
__tests__/
├── fixtures/
│   ├── valid/          # Valid inputs
│   ├── invalid/        # Invalid inputs
│   ├── edge-cases/     # Boundary conditions
│   └── security/       # Security test data
├── mocks/
│   ├── api/
│   └── services/
└── helpers/
    ├── factories/
    └── utilities/
```

### 8.2 Factory Pattern

```typescript
function createEntity(overrides = {}) {
  return {
    id: generateId(),
    name: 'Test Entity',
    status: 'active',
    ...overrides,
  };
}

// Usage
const validEntity = createEntity();
const inactiveEntity = createEntity({ status: 'inactive' });
```

### 8.3 Mock Strategy

| Mock | When | Why |
|------|------|-----|
| External APIs | Always in unit tests | Isolation |
| Database | Unit tests only | Speed |
| Time/Date | When time-dependent | Reproducibility |
| Network | Unit tests only | Reliability |

| Don't Mock | When | Why |
|------------|------|-----|
| Unit under test | Never | That's what you test |
| Core domain logic | Integration tests | Need real behavior |
| Database | Integration tests | Need real queries |

---

## 9. Test Implementation

### 9.1 Unit Test Structure

```typescript
describe('Module', () => {
  describe('function', () => {
    beforeEach(() => {
      // Setup
    });

    describe('when [condition]', () => {
      test('should [behavior]', () => {
        // Arrange
        const input = createInput();

        // Act
        const result = functionUnderTest(input);

        // Assert
        expect(result).toEqual(expected);
      });
    });
  });
});
```

### 9.2 Integration Test Structure

```typescript
describe('Feature', () => {
  const setup = (overrides = {}) => {
    return renderWithContext(<Component />, {
      user: createUser(),
      ...overrides,
    });
  };

  test('Given [context], When [action], Then [result]', async () => {
    // Given
    setup({ permissions: ['write'] });

    // When
    await userEvent.click(screen.getByRole('button'));

    // Then
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeVisible();
    });
  });
});
```

### 9.3 E2E Test Structure

```typescript
test.describe('User Journey', () => {
  test('Complete flow', async ({ page }) => {
    // Setup
    await page.goto('/start');

    // Action
    await page.click('[data-testid="action"]');

    // Intermediate state
    await expect(page.locator('[data-testid="loading"]')).toBeVisible();

    // Final state
    await expect(page.locator('[data-testid="success"]')).toBeVisible();
  });
});
```

See [test-templates.md](test-templates.md) for complete code templates.

---

## 10. Test Execution

### 10.1 Execution Phases

```markdown
### Phase 1: Local (Every Commit)
- [ ] Unit tests pass
- [ ] Lint passes
- [ ] Types check

### Phase 2: CI (Every PR)
- [ ] Full unit tests
- [ ] Integration tests
- [ ] Coverage thresholds

### Phase 3: Pre-Release
- [ ] E2E on staging
- [ ] Performance tests
- [ ] Security scan

### Phase 4: Post-Deploy
- [ ] Smoke tests
- [ ] Monitor errors
```

---

## 11. Coverage Verification

### 11.1 Coverage Targets

| Metric | Target |
|--------|:------:|
| Statements | ≥80% |
| Branches | ≥75% |
| Functions | ≥85% |
| Lines | ≥80% |

### 11.2 Branch Matrix Completion

| Category | Total | Covered | Pending |
|----------|:-----:|:-------:|:-------:|
| Entry Points | 5 | 5 | 0 |
| Auth | 4 | 3 | 1 |
| API | 11 | 9 | 2 |
| **Total** | **20** | **17** | **3** |
