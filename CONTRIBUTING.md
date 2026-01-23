# Contributing to agent-ready

Thank you for your interest in contributing to agent-ready! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Adding New Checks](#adding-new-checks)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)

## Code of Conduct

Be respectful and constructive in all interactions. We welcome contributors of all experience levels.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Git

### Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/agent-ready.git
cd agent-ready

# Install dependencies
npm install

# Verify setup
npm test         # Should pass 22 tests
npm run dev -- scan .  # Should output L2 score
```

## Development Workflow

### Running Locally

```bash
# Development mode (with hot reload)
npm run dev -- scan .

# With specific flags
npm run dev -- scan /path/to/repo --verbose
npm run dev -- scan . --output json
npm run dev -- init --dry-run
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run CLI in development mode |
| `npm test` | Run test suite |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint code linting |
| `npm run format` | Prettier code formatting |
| `npm run build` | Build for production |

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

## Adding New Checks

### 1. Define the Check Type (if new)

Edit `src/types.ts`:

```typescript
// Add to CheckType union
export type CheckType =
  | 'file_exists'
  | 'my_new_type';  // Add here

// Create config interface
export interface MyNewCheckConfig extends BaseCheckConfig {
  type: 'my_new_type';
  my_option: string;
}

// Add to CheckConfig union
export type CheckConfig =
  | FileExistsCheckConfig
  | MyNewCheckConfig;  // Add here
```

### 2. Implement the Check

Create `src/checks/my-new-check.ts`:

```typescript
import { MyNewCheckConfig, CheckResult, ScanContext } from '../types.js';

export async function executeMyNewCheck(
  check: MyNewCheckConfig,
  context: ScanContext
): Promise<CheckResult> {
  // Implementation
  const passed = /* your logic */;

  return {
    check_id: check.id,
    passed,
    message: passed ? 'Check passed' : 'Check failed',
    suggestions: passed ? [] : ['How to fix this']
  };
}
```

### 3. Register the Check

Edit `src/checks/index.ts`:

```typescript
import { executeMyNewCheck } from './my-new-check.js';

// In executeCheck function
case 'my_new_type':
  return executeMyNewCheck(check as MyNewCheckConfig, context);
```

### 4. Add to Profile

Edit `profiles/factory_compat.yaml`:

```yaml
- id: pillar.my_check
  name: My New Check
  description: What this check does
  type: my_new_type
  pillar: docs  # or style, build, test, etc.
  level: L2     # L1-L5
  required: false
  my_option: value
```

### 5. Write Tests

Add to `test/checks.test.ts`:

```typescript
describe('my_new_type check', () => {
  it('should pass when condition met', async () => {
    // Test implementation
  });
});
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Specific Tests

```bash
# Filter by name
npm test -- --grep "file_exists"

# Run single file
npx tsx --test test/checks.test.ts
```

### Test Fixtures

Test fixtures are in `test/fixtures/`:

```
test/fixtures/
├── minimal-repo/     # L1 baseline
├── standard-repo/    # L2+ features
└── monorepo/         # Multi-app structure
```

### Validation Testing

```bash
# Scan a real repository
npm run dev -- scan /path/to/repo

# Compare with expected output
cat readiness.json | jq '.level'
```

## Pull Request Process

### Before Submitting

1. **Run all checks:**
   ```bash
   npm test
   npm run typecheck
   npm run lint
   ```

2. **Update documentation** if needed:
   - README.md for user-facing changes
   - AGENTS.md for structural changes
   - CHANGELOG.md for notable changes

3. **Self-review your code:**
   - Remove debug statements
   - Check for hardcoded values
   - Ensure error handling

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Tests pass locally
- [ ] New tests added (if applicable)
- [ ] Manual testing performed

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
```

### Review Process

1. Create PR against `main` branch
2. Automated checks must pass
3. At least one maintainer approval required
4. Squash and merge preferred

## Code Style

### TypeScript Guidelines

- Use strict mode
- Prefer interfaces over types
- Use `unknown` instead of `any`
- Export types from `types.ts`

### Formatting

```bash
# Auto-format code
npm run format

# Check formatting
npm run lint
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new check type for Docker support
fix: handle missing package.json gracefully
docs: update CONTRIBUTING guide
refactor: simplify level gating logic
test: add fixtures for monorepo detection
```

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- See AGENTS.md for codebase details

Thank you for contributing!
