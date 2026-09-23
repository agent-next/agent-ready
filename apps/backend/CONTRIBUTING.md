# Contributing to agent-ready-backend

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Git
- Redis (for job queue)
- PostgreSQL (optional, for persistence)

### Setup

```bash
# Clone the repository
git clone https://github.com/robotlearning123/agent-ready-backend.git
cd agent-ready-backend

# Clone the agent-ready dependency (sibling directory)
cd ..
git clone https://github.com/robotlearning123/agent-ready.git
cd agent-ready && npm install && npm run build
cd ../agent-ready-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

## Development Workflow

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint code linting |
| `npm run format` | Prettier code formatting |
| `npm test` | Run test suite |

### Branch Naming

```
feat/   - New features
fix/    - Bug fixes
docs/   - Documentation
refactor/ - Code refactoring
test/   - Test additions
```

## Code Style

- TypeScript strict mode
- Prettier for formatting
- ESLint for linting

```bash
# Auto-format code
npm run format

# Check linting
npm run lint
```

## Pull Request Process

1. Create branch from `main`
2. Make changes and commit
3. Ensure all checks pass (`npm run check`)
4. Create PR against `main`
5. Wait for review and approval

## Questions?

Open an issue for bugs or feature requests.
