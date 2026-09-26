# Agent Ready Backend - AI Agent Guide

## Overview

This is the backend API for Agent Ready, providing multi-agent parallel analysis for repository scanning.

## Architecture

```
src/
├── index.ts              # Fastify server entry point
├── config.ts             # Environment configuration
├── routes/               # REST API endpoints
│   ├── scan.ts           # POST /api/scan, GET /api/scan/:id
│   ├── report.ts         # GET /api/report/:id
│   ├── profiles.ts       # GET /api/profiles
│   └── health.ts         # GET /api/health
├── agents/               # Multi-agent orchestration
│   ├── base-agent.ts     # Abstract agent class
│   ├── orchestrator.ts   # Parallel coordinator
│   ├── evaluator.ts      # Cross-pillar analysis
│   ├── reporter.ts       # Report generation
│   └── pillars/          # 9 pillar agents
│       ├── docs.ts
│       ├── style.ts
│       ├── build.ts
│       ├── test.ts
│       ├── security.ts
│       ├── observability.ts
│       ├── environment.ts
│       ├── task-discovery.ts
│       └── product.ts
├── workers/              # Background job processing
│   └── scan-worker.ts    # BullMQ scan worker
├── services/             # External service integrations
│   └── git-service.ts    # Repository cloning
├── i18n/                 # Internationalization
│   └── index.ts          # English/Chinese translations
└── db/                   # Database schema
    └── schema.sql        # PostgreSQL tables
```

## Key Dependencies

- **agent-ready**: Core scanning library (types, checks, profiles)
- **fastify**: HTTP server framework
- **bullmq**: Redis-based job queue
- **ioredis**: Redis client
- **pg**: PostgreSQL client
- **simple-git**: Git operations

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| POST | /api/scan | Submit scan job |
| GET | /api/scan/:id | Get scan status/result |
| GET | /api/report/:id | Get formatted report |
| GET | /api/profiles | List available profiles |

## Multi-Agent System

### Pillar Agents (9 total)

Each agent specializes in one pillar:
- **DocsAgent**: Documentation quality
- **StyleAgent**: Code style and validation
- **BuildAgent**: Build system and CI/CD
- **TestAgent**: Testing coverage
- **SecurityAgent**: Security practices
- **ObservabilityAgent**: Logging and monitoring
- **EnvironmentAgent**: Dev environment setup
- **TaskDiscoveryAgent**: Issue/PR templates
- **ProductAgent**: Feature flags, analytics

### Orchestrator

Coordinates parallel execution of all pillar agents, collects results, and passes to evaluator.

### Evaluator

Performs cross-pillar analysis:
- Determines overall level achieved
- Identifies strengths and weaknesses
- Calculates tech debt score
- Generates cross-pillar insights

### Reporter

Generates enhanced reports with:
- Executive summary
- Pillar details
- Improvement roadmap
- Chart data for visualization

## Environment Variables

```bash
PORT=3000
NODE_ENV=development
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://localhost:5432/agent_ready
CLONE_DIR=/tmp/agent-ready-clones
```

## Development Tips

1. **Adding a new pillar agent**: Create in `src/agents/pillars/`, extend `BaseAgent`, export in `index.ts`
2. **Adding new routes**: Create in `src/routes/`, register in `src/index.ts`
3. **Testing**: Run `npm test` to execute test suite

## Related Repositories

- **agent-ready**: Core CLI and scanning library
- **agent-ready-website**: Frontend web application
