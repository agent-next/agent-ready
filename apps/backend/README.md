# Agent Ready Backend

Multi-agent parallel analysis API for Agent Ready scanning.

## Architecture

This backend uses a multi-agent system to analyze repositories in parallel:

- **9 Pillar Agents**: Docs, Style, Build, Test, Security, Observability, Environment, Task Discovery, Product
- **Orchestrator**: Coordinates parallel execution of all pillar agents
- **Evaluator**: Cross-pillar analysis and level determination
- **Reporter**: Generates enhanced reports with insights

## Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/scan` - Submit a repository for scanning
- `GET /api/scan/:id` - Get scan status/results
- `GET /api/report/:id` - Get formatted report
- `GET /api/profiles` - List available profiles

## Environment Variables

See `.env.example` for required configuration.

## Docker

```bash
docker-compose up -d
```

## Dependencies

This backend depends on `agent-ready` for core scanning functionality:
- Types (Level, Pillar, CheckConfig, etc.)
- Check executors
- Profile loading
- Context building

## License

Private - All rights reserved.
