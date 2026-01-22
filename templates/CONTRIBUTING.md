# Contributing to {{PROJECT_NAME}}

Thank you for your interest in contributing! This document provides guidelines and steps for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Provide clear reproduction steps
4. Include relevant environment information

### Suggesting Features

1. Check existing issues/discussions
2. Open a feature request issue
3. Describe the problem it solves
4. Propose a solution if you have one

### Submitting Code

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Write/update tests
5. Run the test suite (`npm test`)
6. Commit with a clear message
7. Push and open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/{{REPO_NAME}}.git
cd {{REPO_NAME}}

# Install dependencies
npm install

# Run tests
npm test

# Start development
npm run dev
```

## Code Style

- We use [ESLint/Prettier] for code formatting
- Run `npm run lint` before committing
- Follow existing patterns in the codebase

## Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Keep the first line under 72 characters
- Reference issues when applicable

## Pull Request Process

1. Update README.md if needed
2. Update documentation if needed
3. The PR will be merged once you have approval from maintainers

## Questions?

Feel free to open an issue for any questions not covered here.
