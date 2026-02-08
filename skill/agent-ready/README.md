# agent-ready

Repository maturity scanner for AI agent collaboration.

## Installation

```bash
npx skills add agent-next/agent-ready --path skill/agent-ready
```

## What it does

Evaluates codebases using the Factory.ai-compatible 9 Pillars / 5 Levels model:

**9 Pillars:** Documentation, Style, Build, Test, Security, Observability, Environment, Task Discovery, Product

**5 Levels:** L1 (Functional) → L2 (Documented) → L3 (Standardized) → L4 (Optimized) → L5 (Autonomous)

## Usage

```bash
# Scan repository
npx agent-ready scan .

# Generate missing files
npx agent-ready init . --level L2

# Chinese output
npx agent-ready scan . --lang zh
```

## Links

- [Website](https://agent-ready.org)
- [npm package](https://www.npmjs.com/package/agent-ready)
- [GitHub repository](https://github.com/agent-next/agent-ready)
