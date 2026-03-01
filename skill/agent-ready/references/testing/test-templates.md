# Test Code Templates

Complete, copy-paste ready test templates for Unit, Integration, and E2E tests.

---

## Unit Test Template (Full Mock)

```typescript
// __tests__/module.helpers.test.ts

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { processInput, validateData, handleError } from '../module';
import { mockAPI, mockToast } from './mocks';

describe('processInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Branch: Valid input → success
  test('B01: valid input returns processed result', async () => {
    const input = createValidInput();
    const result = await processInput(input);
    expect(result).toMatchObject({ status: 'success' });
  });

  // Branch: Empty input → error
  test('B02: empty input throws error', async () => {
    await expect(processInput('')).rejects.toThrow('Input required');
  });

  // Branch: Whitespace input → error (common bug!)
  test('B03: whitespace-only input throws error', async () => {
    await expect(processInput('   ')).rejects.toThrow('Input required');
  });

  // Branch: null input → error
  test('B04: null input throws error', async () => {
    await expect(processInput(null)).rejects.toThrow();
  });
});

describe('validateData', () => {
  test.each([
    [null, 'handles null'],
    [undefined, 'handles undefined'],
    ['', 'handles empty string'],
    ['   ', 'handles whitespace'],
    [[], 'handles empty array'],
  ])('%s: %s', (value, _description) => {
    expect(validateData(value)).toBe(false);
  });

  test('valid data returns true', () => {
    expect(validateData({ name: 'test' })).toBe(true);
  });
});

describe('handleError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Error type branches
  test('M01: Error object shows error.message', () => {
    handleError(new Error('Custom message'));
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Custom message',
      variant: 'destructive',
    });
  });

  test('M02: string error shows default message', () => {
    handleError('string error');
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'An error occurred',
      variant: 'destructive',
    });
  });

  test('M03: null error shows default message', () => {
    handleError(null);
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'An error occurred' })
    );
  });
});
```

---

## Integration Test Template (Partial Mock)

```typescript
// __tests__/feature.integration.test.ts

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Feature } from '../Feature';
import { setupAuth, setupCredits, setupAPI } from './mocks';

// Helper: Upload file
const uploadFile = async (filename: string, type: string) => {
  const file = new File(['content'], filename, { type });
  const input = screen.getByTestId('file-input');
  await userEvent.upload(input, file);
};

describe('Feature Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default context: logged in, sufficient credits
    setupAuth({ user: { id: '1' }, loading: false });
    setupCredits({ amount: 100, loading: false });
  });

  describe('Entry Point Branches', () => {
    test('E01: no input → show placeholder', () => {
      render(<Feature />);
      expect(screen.getByText(/enter.*input/i)).toBeVisible();
    });

    test('E02: valid input → process', async () => {
      setupAPI({ success: true, data: { id: '123' } });
      render(<Feature />);

      await userEvent.type(screen.getByRole('textbox'), 'valid input');
      await userEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeVisible();
      });
    });
  });

  describe('Authentication Branches', () => {
    test('A01: authenticated → proceed', async () => {
      setupAuth({ user: { id: '1' }, loading: false });
      render(<Feature />);

      await userEvent.click(screen.getByRole('button', { name: /submit/i }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('A02: not authenticated → show login', async () => {
      setupAuth({ user: null, loading: false });
      render(<Feature />);

      await userEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeVisible();
        expect(screen.getByText(/sign in/i)).toBeVisible();
      });
    });
  });

  describe('Credit Branches', () => {
    test('L01: sufficient credits → proceed', async () => {
      setupCredits({ amount: 100, isPremium: false });
      setupAPI({ success: true });
      render(<Feature />);

      await userEvent.type(screen.getByRole('textbox'), 'input');
      await userEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/processing/i)).toBeVisible();
      });
    });

    test('L02: insufficient credits → show error', async () => {
      setupCredits({ amount: 5, isPremium: false }); // < 10 required
      render(<Feature />);

      await userEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/insufficient/i)).toBeVisible();
      });
    });

    test('L03: boundary - exactly enough → proceed', async () => {
      setupCredits({ amount: 10, isPremium: false }); // exactly 10
      setupAPI({ success: true });
      render(<Feature />);

      await userEvent.type(screen.getByRole('textbox'), 'input');
      await userEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/processing/i)).toBeVisible();
      });
    });

    test('L05: premium user → skip credit check', async () => {
      setupCredits({ amount: 0, isPremium: true });
      setupAPI({ success: true });
      render(<Feature />);

      await userEvent.type(screen.getByRole('textbox'), 'input');
      await userEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/processing/i)).toBeVisible();
      });
    });
  });

  describe('API Response Branches', () => {
    test('X01: 200 + data → show result', async () => {
      setupAPI({ status: 200, data: { result: 'success' } });
      render(<Feature />);

      await userEvent.type(screen.getByRole('textbox'), 'input');
      await userEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeVisible();
      });
    });

    test('X09: 500 error → show error + retry', async () => {
      setupAPI({ status: 500, error: 'Server error' });
      render(<Feature />);

      await userEvent.type(screen.getByRole('textbox'), 'input');
      await userEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeVisible();
        expect(screen.getByRole('button', { name: /retry/i })).toBeVisible();
      });
    });

    test('X10: network error → show offline message', async () => {
      setupAPI({ networkError: true });
      render(<Feature />);

      await userEvent.type(screen.getByRole('textbox'), 'input');
      await userEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/network|offline|connection/i)).toBeVisible();
      });
    });
  });
});
```

---

## E2E Test Template (No Mock)

```typescript
// e2e/feature.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Feature E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Real login
    await page.goto('/login');
    await page.fill('[name="email"]', process.env.TEST_EMAIL!);
    await page.fill('[name="password"]', process.env.TEST_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('E2E-01: Complete happy path', async ({ page }) => {
    // Navigate
    await page.goto('/feature');

    // Upload file (real file)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('e2e/fixtures/valid-input.png');

    // Verify preview
    await expect(page.locator('img[alt*="preview"]')).toBeVisible();

    // Submit
    await page.click('button:has-text("Submit")');

    // Verify processing state
    await expect(page.locator('text=Processing')).toBeVisible();

    // Wait for completion (real API, may take time)
    await expect(page.locator('text=Complete')).toBeVisible({ timeout: 30000 });

    // Verify result
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });

  test('E2E-02: Error recovery flow', async ({ page }) => {
    await page.goto('/feature');

    // Use invalid input
    await page.fill('[name="input"]', '');
    await page.click('button:has-text("Submit")');

    // Verify error shown
    await expect(page.locator('text=Required')).toBeVisible();

    // Recover: enter valid input
    await page.fill('[name="input"]', 'valid input');
    await page.click('button:has-text("Submit")');

    // Should succeed now
    await expect(page.locator('text=Processing')).toBeVisible();
  });

  test('E2E-03: Not authenticated redirect', async ({ page, context }) => {
    // Clear auth
    await context.clearCookies();

    await page.goto('/feature');
    await page.click('button:has-text("Submit")');

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('E2E-04: Chaos - double click handling', async ({ page }) => {
    await page.goto('/feature');
    await page.fill('[name="input"]', 'test');

    // Double click
    await page.dblclick('button:has-text("Submit")');

    // Should only process once
    await expect(page.locator('[data-testid="processing"]')).toHaveCount(1);
  });
});
```

---

## Mock Setup Helpers

```typescript
// __tests__/mocks/setup.ts

import { vi } from 'vitest';

export const setupAuth = (config: { user: object | null; loading: boolean }) => {
  vi.mocked(useAuth).mockReturnValue(config);
};

export const setupCredits = (config: { amount: number; isPremium?: boolean; loading?: boolean }) => {
  vi.mocked(useCredits).mockReturnValue({
    credits: config.amount,
    isPremium: config.isPremium ?? false,
    loading: config.loading ?? false,
  });
};

export const setupAPI = (config: {
  status?: number;
  data?: object;
  error?: string;
  networkError?: boolean;
  success?: boolean;
}) => {
  if (config.networkError) {
    vi.mocked(api.request).mockRejectedValue(new Error('Network error'));
    return;
  }

  vi.mocked(api.request).mockResolvedValue({
    status: config.status ?? 200,
    data: config.data ?? {},
    error: config.error,
    ok: config.success ?? (config.status === 200),
  });
};
```

---

## Test Data Factories

```typescript
// __tests__/factories/index.ts

let idCounter = 0;

export const createUser = (overrides = {}) => ({
  id: `user-${++idCounter}`,
  email: `test${idCounter}@example.com`,
  name: 'Test User',
  role: 'user',
  ...overrides,
});

export const createEntity = (overrides = {}) => ({
  id: `entity-${++idCounter}`,
  name: 'Test Entity',
  status: 'active',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createValidInput = () => ({
  text: 'Valid input text',
  type: 'default',
});

export const createEdgeCaseInputs = () => ({
  null: null,
  undefined: undefined,
  emptyString: '',
  whitespace: '   ',
  emptyArray: [],
  emptyObject: {},
  maxLength: 'a'.repeat(255),
  unicode: '中文测试 🎉',
  xss: '<script>alert("xss")</script>',
});
```
