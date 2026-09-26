# Contributing to agent-ready-website

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/robotlearning123/agent-ready-website.git
cd agent-ready-website

# Install dependencies
npm install

# Start development server
npm run dev
```

## Development Workflow

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
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
style/  - Styling changes
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Cloudflare Pages** - Hosting

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
