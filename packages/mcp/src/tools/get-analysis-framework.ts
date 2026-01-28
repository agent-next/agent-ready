/**
 * get_analysis_framework tool - Returns the 10-pillar/5-level analysis framework
 *
 * This tool provides the evaluation framework so Claude can perform
 * its own quality-based analysis instead of just running checks.
 */

import { z } from 'zod';

export const getAnalysisFrameworkSchema = z.object({
  pillar: z
    .enum([
      'docs',
      'style',
      'build',
      'test',
      'security',
      'observability',
      'env',
      'task_discovery',
      'product',
      'agent_config',
    ])
    .optional()
    .describe('Optional: Get framework for specific pillar'),
});

export type GetAnalysisFrameworkInput = z.infer<typeof getAnalysisFrameworkSchema>;

interface PillarFramework {
  name: string;
  description: string;
  key_files: string[];
  scoring_rubric: {
    '0-20': string;
    '21-40': string;
    '41-60': string;
    '61-80': string;
    '81-100': string;
  };
  evaluation_questions: string[];
}

const PILLARS: Record<string, PillarFramework> = {
  docs: {
    name: 'Documentation',
    description: 'Project documentation for humans and AI agents',
    key_files: ['README.md', 'AGENTS.md', 'CLAUDE.md', 'CONTRIBUTING.md', 'docs/'],
    scoring_rubric: {
      '0-20': 'No README or empty file',
      '21-40': 'README exists with only project name',
      '41-60': 'Has installation and basic usage',
      '61-80': 'Has API docs, examples, troubleshooting',
      '81-100': 'Complete, accurate, with diagrams',
    },
    evaluation_questions: [
      'Is the project purpose clear from README?',
      'Can installation steps be followed exactly?',
      'Do code examples work if copied?',
      'Is AGENTS.md actionable for AI agents?',
      'Does documentation match actual code?',
    ],
  },
  style: {
    name: 'Style & Validation',
    description: 'Code quality, linting, and formatting',
    key_files: ['.eslintrc*', '.prettierrc*', 'tsconfig.json', '.pre-commit-config.yaml'],
    scoring_rubric: {
      '0-20': 'No linting/formatting config',
      '21-40': 'Config exists but not enforced',
      '41-60': 'Linting in CI, some type safety',
      '61-80': 'Strict types, pre-commit hooks',
      '81-100': 'Zero lint errors, 100% type coverage',
    },
    evaluation_questions: [
      'Is TypeScript set to strict mode?',
      'Are lint rules consistent with code patterns?',
      'Are pre-commit hooks configured and working?',
      'Is formatting consistent across codebase?',
    ],
  },
  build: {
    name: 'Build System',
    description: 'Build scripts, CI/CD, reproducibility',
    key_files: ['package.json', '.github/workflows/*.yml', 'Makefile', 'Dockerfile'],
    scoring_rubric: {
      '0-20': 'No build script or broken build',
      '21-40': 'Build exists but not automated',
      '41-60': 'CI runs on push/PR',
      '61-80': 'Caching, parallelization, artifacts',
      '81-100': 'Canary deploys, auto-rollback',
    },
    evaluation_questions: [
      'Does npm run build succeed?',
      'Is CI configured for push and PR?',
      'Is dependency caching enabled?',
      'Are build artifacts properly handled?',
    ],
  },
  test: {
    name: 'Testing',
    description: 'Test coverage, quality, and types',
    key_files: ['test/', 'tests/', '__tests__/', 'jest.config.*', 'vitest.config.*'],
    scoring_rubric: {
      '0-20': 'No tests or only placeholder',
      '21-40': 'Some unit tests, low coverage',
      '41-60': 'Good unit tests, >50% coverage',
      '61-80': 'Unit + integration, >80% coverage',
      '81-100': 'Mutation testing, property tests',
    },
    evaluation_questions: [
      'Do tests actually pass?',
      'What is the code coverage percentage?',
      'Are there integration/e2e tests?',
      'Are edge cases tested?',
    ],
  },
  security: {
    name: 'Security',
    description: 'Secret management, dependency updates, scanning',
    key_files: ['.gitignore', '.github/dependabot.yml', 'CODEOWNERS', '.github/workflows/codeql*'],
    scoring_rubric: {
      '0-20': 'No .gitignore or exposes secrets',
      '21-40': 'Basic .gitignore exists',
      '41-60': 'Secrets ignored, dependabot enabled',
      '61-80': 'CODEOWNERS, secret scanning',
      '81-100': 'SAST in CI, SBOM generation',
    },
    evaluation_questions: [
      'Does .gitignore cover .env, credentials?',
      'Is dependabot configured?',
      'Are there exposed secrets in code?',
      'Is SAST integrated in CI?',
    ],
  },
  observability: {
    name: 'Observability',
    description: 'Logging, tracing, metrics',
    key_files: ['package.json (logging deps)', 'tracing config'],
    scoring_rubric: {
      '0-20': 'console.log only',
      '21-40': 'Basic logging framework',
      '41-60': 'Structured JSON logging',
      '61-80': 'Distributed tracing, metrics',
      '81-100': 'Full APM, dashboards, alerts',
    },
    evaluation_questions: [
      'Is logging structured (JSON)?',
      'Are log levels used appropriately?',
      'Is there distributed tracing?',
      'Are metrics being collected?',
    ],
  },
  env: {
    name: 'Development Environment',
    description: 'Local setup, containerization',
    key_files: ['.env.example', '.devcontainer/', 'docker-compose.yml'],
    scoring_rubric: {
      '0-20': 'No setup documentation',
      '21-40': '.env.example exists',
      '41-60': 'docker-compose for local dev',
      '61-80': 'Devcontainer configured',
      '81-100': 'One-command setup, codespaces ready',
    },
    evaluation_questions: [
      'Can a new dev get started in <10 minutes?',
      'Are all env vars documented?',
      'Does docker-compose work?',
      'Is there a devcontainer?',
    ],
  },
  task_discovery: {
    name: 'Task Discovery',
    description: 'Issue/PR templates, contribution flow',
    key_files: ['.github/ISSUE_TEMPLATE/', '.github/PULL_REQUEST_TEMPLATE.md'],
    scoring_rubric: {
      '0-20': 'No issue/PR templates',
      '21-40': 'Basic templates exist',
      '41-60': 'Structured templates with fields',
      '61-80': 'Labels, milestones, project boards',
      '81-100': 'Automated triage, bots configured',
    },
    evaluation_questions: [
      'Do templates have required fields?',
      'Are issues labeled consistently?',
      'Is there a clear contribution path?',
    ],
  },
  product: {
    name: 'Product & Experimentation',
    description: 'Feature flags, analytics, A/B testing',
    key_files: ['package.json (feature flag/analytics deps)'],
    scoring_rubric: {
      '0-20': 'No feature flags or analytics',
      '21-40': 'Basic analytics SDK',
      '41-60': 'Feature flags implemented',
      '61-80': 'A/B testing infrastructure',
      '81-100': 'Full experimentation platform',
    },
    evaluation_questions: [
      'Are feature flags used for rollouts?',
      'Is analytics tracking user journeys?',
      'Can experiments be run safely?',
    ],
  },
  agent_config: {
    name: 'Agent Configuration',
    description: 'AI agent instructions, permissions, MCP integration',
    key_files: [
      'AGENTS.md',
      'CLAUDE.md',
      '.claude/settings.json',
      '.claude/commands/',
      '.cursorrules',
      '.cursor/rules',
      '.aider.conf.yml',
      '.github/copilot-instructions.md',
      '.windsurfrules',
      'mcp.json',
      '.claude/hooks/',
    ],
    scoring_rubric: {
      '0-20': 'No agent instruction files',
      '21-40': 'Basic AGENTS.md exists',
      '41-60': 'Structured configs (.cursorrules, etc.)',
      '61-80': 'MCP integration, hooks configured',
      '81-100': 'Autonomous workflows, multi-agent',
    },
    evaluation_questions: [
      'Is AGENTS.md actionable for AI agents?',
      'Does it explain key commands?',
      'Are permissions properly configured?',
      'Is there MCP server integration?',
      'Can agents work autonomously?',
    ],
  },
};

const LEVELS = {
  L1: { name: 'Functional', range: '0-20', description: 'Basic functionality works' },
  L2: { name: 'Documented', range: '21-40', description: 'Essential documentation' },
  L3: { name: 'Standardized', range: '41-60', description: 'Standard practices' },
  L4: { name: 'Optimized', range: '61-80', description: 'Advanced automation' },
  L5: { name: 'Autonomous', range: '81-100', description: 'Self-improving, AI-ready' },
};

export async function getAnalysisFramework(input: GetAnalysisFrameworkInput): Promise<string> {
  const { pillar } = input;

  if (pillar) {
    // Return framework for specific pillar
    const framework = PILLARS[pillar];
    if (!framework) {
      return JSON.stringify({ error: `Unknown pillar: ${pillar}` });
    }
    return JSON.stringify({ pillar, ...framework }, null, 2);
  }

  // Return full framework
  return JSON.stringify(
    {
      version: '0.0.2',
      pillars: PILLARS,
      levels: LEVELS,
      scoring: {
        passing_threshold: 0.8,
        description: '80% of checks must pass per level to achieve that level',
      },
    },
    null,
    2
  );
}
