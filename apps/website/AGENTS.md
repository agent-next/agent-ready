# Agent Ready Website - AI Agent Guide

## Overview

This is the frontend web application for Agent Ready, allowing users to scan repositories and view readiness reports.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first styling
- **Cloudflare Pages** - Hosting with edge functions

## Project Structure

```
src/
├── App.tsx               # Main application component
├── main.tsx              # Entry point
├── index.css             # Global styles + Tailwind
├── components/           # Reusable UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ScanForm.tsx
│   └── ResultCard.tsx
├── pages/                # Route pages
│   ├── Home.tsx
│   ├── Scan.tsx
│   └── Report.tsx
└── hooks/                # Custom React hooks
    └── useScan.ts

functions/                # Cloudflare Pages Functions
└── api/
    └── scan.ts           # Proxy to backend API

public/                   # Static assets
├── favicon.ico
└── logo.svg
```

## Key Features

1. **Repository Scanner** - Submit GitHub URLs for analysis
2. **Real-time Progress** - WebSocket updates during scan
3. **Interactive Reports** - Pillar breakdown with recommendations
4. **Level Badges** - Visual representation of maturity level

## API Integration

The website communicates with `agent-ready-backend`:

```typescript
// POST /api/scan
const response = await fetch('/api/scan', {
  method: 'POST',
  body: JSON.stringify({ repo_url: 'https://github.com/...' })
});

// GET /api/scan/:id
const result = await fetch(`/api/scan/${scanId}`);

// GET /api/report/:id
const report = await fetch(`/api/report/${scanId}`);
```

## Environment Variables

```bash
# .env.example
VITE_API_URL=http://localhost:3000
```

```bash
# .env.production
VITE_API_URL=https://api.agent-ready.org
```

## Development Tips

1. **Adding components**: Create in `src/components/`, use TypeScript interfaces
2. **Styling**: Use Tailwind utility classes, avoid custom CSS
3. **State management**: React hooks + context, no external state library
4. **Testing**: Vitest for unit tests, Playwright for E2E

## Deployment

Deployed automatically via Cloudflare Pages on push to `main`.

```bash
# Manual deploy
npm run build
npx wrangler pages deploy dist
```

## Related Repositories

- **agent-ready**: Core CLI and scanning library
- **agent-ready-backend**: API server with multi-agent system
