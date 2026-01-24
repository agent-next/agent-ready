# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email security concerns to: security@agent-ready.org
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours of your report
- **Initial Assessment**: Within 5 business days
- **Resolution Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 7 days
  - Medium: 30 days
  - Low: 90 days

### Security Best Practices

When using agent-ready:

1. **API Keys**: Never commit API keys or secrets to repositories
2. **Scanned Repositories**: Only scan repositories you have permission to access
3. **Output Files**: `readiness.json` may contain repository metadata - treat accordingly
4. **Docker**: Use official images and keep them updated

### Scope

This security policy covers:

- The `agent-ready` CLI tool
- The agent-ready API service
- Official Docker images
- This GitHub repository

### Recognition

We appreciate responsible disclosure. Contributors who report valid security issues will be:

- Credited in release notes (unless anonymity preferred)
- Added to our security acknowledgments

## Security Features

agent-ready includes these security measures:

- **Path Traversal Protection**: `safePath()` validates all file operations
- **ReDoS Protection**: `safeRegex()` validates regex patterns
- **No External API Calls**: CLI scanning is entirely local
- **Minimal Dependencies**: Reduced attack surface
- **TypeScript Strict Mode**: Compile-time safety checks

## Dependencies

We use Dependabot for automated security updates. Critical vulnerabilities in dependencies are addressed within 24 hours.
