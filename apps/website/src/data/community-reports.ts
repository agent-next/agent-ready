/**
 * Community Reports - Featured Repository Data with Full Scan Results
 *
 * Pre-scanned popular open-source projects showcasing agent readiness levels.
 */

import type { ScanResult } from '../api/scan';

export interface CommunityRepo {
  id: string;
  name: string;
  fullName: string;
  language: string;
  level: number;
  score: number;
  description: string;
  stars?: number;
  url: string;
  scanResult: ScanResult;
}

// Language badge colors
export const LANGUAGE_COLORS: Record<string, { bg: string; text: string }> = {
  Go: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  Python: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  TypeScript: { bg: 'bg-blue-100', text: 'text-blue-700' },
  JavaScript: { bg: 'bg-amber-100', text: 'text-amber-700' },
  Rust: { bg: 'bg-orange-100', text: 'text-orange-700' },
  Java: { bg: 'bg-red-100', text: 'text-red-700' },
};

// Helper to generate pillar data
function makePillars(scores: number[]): ScanResult['detailed_analysis']['pillars'] {
  const names = [
    'Documentation',
    'Code Style',
    'Build System',
    'Testing',
    'Security',
    'Observability',
    'Environment',
    'Task Discovery',
    'Product',
  ];
  const icons = ['📖', '✨', '🔧', '🧪', '🔒', '📊', '🌍', '📋', '🚀'];
  return names.map((name, i) => ({
    pillar: name.toLowerCase().replace(' ', '_'),
    level_achieved: Math.floor(scores[i] / 20) || 1,
    score: scores[i],
    icon: icons[i],
    name,
    checks_passed: Math.floor(scores[i] / 10),
    checks_total: 10,
  }));
}

function makeLevelProgress(level: number, score: number): ScanResult['charts']['level_progress'] {
  return [1, 2, 3, 4, 5].map((l) => ({
    level: l,
    achieved: l <= level,
    score: l < level ? 100 : l === level ? score : 0,
  }));
}

// Helper to create charts from pillars (avoids duplicate makePillars calls)
function makeCharts(
  pillars: ScanResult['detailed_analysis']['pillars'],
  level: number,
  score: number
): ScanResult['charts'] {
  return {
    pillar_radar: pillars.map((p) => ({ pillar: p.name, score: p.score })),
    level_progress: makeLevelProgress(level, score),
  };
}

// Pre-compute pillars for each repo to avoid duplication
const COCKROACHDB_PILLARS = makePillars([85, 78, 82, 88, 75, 55, 70, 68, 65]);
const TEMPORAL_PILLARS = makePillars([80, 75, 85, 82, 72, 60, 75, 62, 68]);
const SUPERSET_PILLARS = makePillars([82, 70, 78, 68, 80, 58, 82, 72, 65]);
const FASTAPI_PILLARS = makePillars([88, 72, 55, 48, 52, 35, 45, 55, 42]);
const STREAMLIT_PILLARS = makePillars([75, 68, 52, 55, 45, 48, 58, 60, 52]);
const GHCLI_PILLARS = makePillars([55, 65, 62, 58, 52, 28, 42, 48, 38]);
const FLASK_PILLARS = makePillars([65, 55, 42, 48, 38, 18, 25, 32, 22]);
const EXPRESS_PILLARS = makePillars([45, 42, 35, 38, 32, 12, 18, 22, 15]);

export const FEATURED_REPOS: CommunityRepo[] = [
  {
    id: 'cockroachdb',
    name: 'CockroachDB',
    fullName: 'cockroachdb/cockroach',
    language: 'Go',
    level: 4,
    score: 74,
    description: 'Distributed SQL database with strong consistency and horizontal scalability.',
    stars: 30200,
    url: 'https://github.com/cockroachdb/cockroach',
    scanResult: {
      meta: {
        repo: 'cockroachdb/cockroach',
        commit: 'a1b2c3d',
        timestamp: '2024-01-15T10:30:00Z',
        scan_duration_ms: 45000,
        agents_used: 9,
      },
      executive_summary: {
        level: 4,
        score: 74,
        headline:
          'CockroachDB demonstrates excellent agent readiness with comprehensive documentation and robust testing infrastructure.',
        key_strengths: [
          'Extensive documentation with architecture guides',
          'Comprehensive test coverage (>80%)',
          'Well-defined contribution guidelines',
        ],
        critical_gaps: ['Limited observability instrumentation', 'Missing AGENTS.md file'],
        next_steps: ['Add AGENTS.md for AI agent guidance', 'Implement OpenTelemetry tracing'],
      },
      detailed_analysis: {
        pillars: COCKROACHDB_PILLARS,
        cross_pillar_insights: [
          {
            type: 'strength',
            pillars: ['documentation', 'testing'],
            insight: 'Strong correlation between docs and test coverage',
            recommendation: 'Maintain this pattern',
          },
          {
            type: 'opportunity',
            pillars: ['observability', 'environment'],
            insight: 'Observability could be enhanced with better dev tooling',
            recommendation: 'Add docker-compose for local observability stack',
          },
        ],
        tech_debt_score: 22,
      },
      improvement_roadmap: {
        quick_wins: [
          { pillar: 'Documentation', action: 'Add AGENTS.md file', impact: 'high', effort: 'low' },
        ],
        short_term: [
          {
            pillar: 'Observability',
            action: 'Add structured logging guidelines',
            impact: 'medium',
            effort: 'medium',
          },
        ],
        medium_term: [
          {
            pillar: 'Environment',
            action: 'Create devcontainer configuration',
            impact: 'high',
            effort: 'medium',
          },
        ],
        long_term: [
          {
            pillar: 'Product',
            action: 'Implement feature flag system',
            impact: 'medium',
            effort: 'high',
          },
        ],
      },
      charts: makeCharts(COCKROACHDB_PILLARS, 4, 74),
    },
  },
  {
    id: 'temporal',
    name: 'Temporal',
    fullName: 'temporalio/temporal',
    language: 'Go',
    level: 4,
    score: 74,
    description: 'Durable execution system for building reliable distributed applications.',
    stars: 12500,
    url: 'https://github.com/temporalio/temporal',
    scanResult: {
      meta: {
        repo: 'temporalio/temporal',
        commit: 'd4e5f6g',
        timestamp: '2024-01-15T11:00:00Z',
        scan_duration_ms: 38000,
        agents_used: 9,
      },
      executive_summary: {
        level: 4,
        score: 74,
        headline:
          'Temporal shows strong agent readiness with excellent build system and testing practices.',
        key_strengths: [
          'Makefile-based build with clear targets',
          'Extensive integration tests',
          'Good API documentation',
        ],
        critical_gaps: [
          'Observability metrics could be improved',
          'Missing contribution templates',
        ],
        next_steps: ['Add issue templates', 'Document observability patterns'],
      },
      detailed_analysis: {
        pillars: TEMPORAL_PILLARS,
        cross_pillar_insights: [
          {
            type: 'strength',
            pillars: ['build', 'testing'],
            insight: 'Build and test integration is seamless',
            recommendation: 'Document this for contributors',
          },
        ],
        tech_debt_score: 25,
      },
      improvement_roadmap: {
        quick_wins: [
          {
            pillar: 'Task Discovery',
            action: 'Add issue templates',
            impact: 'medium',
            effort: 'low',
          },
        ],
        short_term: [
          {
            pillar: 'Observability',
            action: 'Add metrics documentation',
            impact: 'medium',
            effort: 'medium',
          },
        ],
        medium_term: [
          {
            pillar: 'Documentation',
            action: 'Create architecture decision records',
            impact: 'high',
            effort: 'medium',
          },
        ],
        long_term: [
          {
            pillar: 'Product',
            action: 'Add feature flag documentation',
            impact: 'low',
            effort: 'high',
          },
        ],
      },
      charts: makeCharts(TEMPORAL_PILLARS, 4, 74),
    },
  },
  {
    id: 'superset',
    name: 'Apache Superset',
    fullName: 'apache/superset',
    language: 'Python',
    level: 4,
    score: 72,
    description: 'Modern data exploration and visualization platform.',
    stars: 63800,
    url: 'https://github.com/apache/superset',
    scanResult: {
      meta: {
        repo: 'apache/superset',
        commit: 'h7i8j9k',
        timestamp: '2024-01-15T12:00:00Z',
        scan_duration_ms: 52000,
        agents_used: 9,
      },
      executive_summary: {
        level: 4,
        score: 72,
        headline: 'Apache Superset has mature agent readiness with strong community practices.',
        key_strengths: [
          'Comprehensive contributor documentation',
          'Docker-based development environment',
          'Active security practices',
        ],
        critical_gaps: ['Test coverage could be higher', 'Observability documentation limited'],
        next_steps: ['Improve test coverage', 'Add observability guide'],
      },
      detailed_analysis: {
        pillars: SUPERSET_PILLARS,
        cross_pillar_insights: [
          {
            type: 'strength',
            pillars: ['environment', 'security'],
            insight: 'Docker setup includes security best practices',
            recommendation: 'Document this pattern',
          },
        ],
        tech_debt_score: 28,
      },
      improvement_roadmap: {
        quick_wins: [
          { pillar: 'Testing', action: 'Add test coverage badge', impact: 'low', effort: 'low' },
        ],
        short_term: [
          {
            pillar: 'Testing',
            action: 'Increase unit test coverage',
            impact: 'high',
            effort: 'medium',
          },
        ],
        medium_term: [
          {
            pillar: 'Observability',
            action: 'Add tracing documentation',
            impact: 'medium',
            effort: 'medium',
          },
        ],
        long_term: [
          {
            pillar: 'Product',
            action: 'Implement analytics tracking guide',
            impact: 'medium',
            effort: 'high',
          },
        ],
      },
      charts: makeCharts(SUPERSET_PILLARS, 4, 72),
    },
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    fullName: 'fastapi/fastapi',
    language: 'Python',
    level: 3,
    score: 53,
    description: 'High-performance web framework for building APIs with Python type hints.',
    stars: 79500,
    url: 'https://github.com/fastapi/fastapi',
    scanResult: {
      meta: {
        repo: 'fastapi/fastapi',
        commit: 'l0m1n2o',
        timestamp: '2024-01-15T13:00:00Z',
        scan_duration_ms: 28000,
        agents_used: 9,
      },
      executive_summary: {
        level: 3,
        score: 53,
        headline:
          'FastAPI has good documentation but needs improvements in testing and observability.',
        key_strengths: [
          'Excellent API documentation',
          'Strong type hints usage',
          'Active maintainer engagement',
        ],
        critical_gaps: [
          'Limited test infrastructure docs',
          'No observability guide',
          'Missing AGENTS.md',
        ],
        next_steps: [
          'Add testing guide for contributors',
          'Create AGENTS.md',
          'Add observability examples',
        ],
      },
      detailed_analysis: {
        pillars: FASTAPI_PILLARS,
        cross_pillar_insights: [
          {
            type: 'strength',
            pillars: ['documentation', 'code_style'],
            insight: 'Documentation and code quality are well aligned',
            recommendation: 'Extend to other pillars',
          },
          {
            type: 'risk',
            pillars: ['testing', 'observability'],
            insight: 'Testing and observability lag behind',
            recommendation: 'Prioritize these areas',
          },
        ],
        tech_debt_score: 35,
      },
      improvement_roadmap: {
        quick_wins: [
          { pillar: 'Documentation', action: 'Add AGENTS.md', impact: 'high', effort: 'low' },
        ],
        short_term: [
          { pillar: 'Testing', action: 'Document test patterns', impact: 'high', effort: 'medium' },
        ],
        medium_term: [
          {
            pillar: 'Observability',
            action: 'Add observability examples',
            impact: 'medium',
            effort: 'medium',
          },
        ],
        long_term: [
          {
            pillar: 'Environment',
            action: 'Create devcontainer',
            impact: 'medium',
            effort: 'medium',
          },
        ],
      },
      charts: makeCharts(FASTAPI_PILLARS, 3, 53),
    },
  },
  {
    id: 'streamlit',
    name: 'Streamlit',
    fullName: 'streamlit/streamlit',
    language: 'Python',
    level: 3,
    score: 54,
    description: 'Build data apps in minutes with pure Python.',
    stars: 36400,
    url: 'https://github.com/streamlit/streamlit',
    scanResult: {
      meta: {
        repo: 'streamlit/streamlit',
        commit: 'p3q4r5s',
        timestamp: '2024-01-15T14:00:00Z',
        scan_duration_ms: 32000,
        agents_used: 9,
      },
      executive_summary: {
        level: 3,
        score: 54,
        headline:
          'Streamlit shows decent agent readiness with room for improvement in infrastructure docs.',
        key_strengths: ['Good user documentation', 'Clear contribution guide', 'Active community'],
        critical_gaps: [
          'Build system documentation sparse',
          'Security practices undocumented',
          'No AGENTS.md',
        ],
        next_steps: ['Document build process', 'Add security policy', 'Create AGENTS.md'],
      },
      detailed_analysis: {
        pillars: STREAMLIT_PILLARS,
        cross_pillar_insights: [
          {
            type: 'opportunity',
            pillars: ['build', 'environment'],
            insight: 'Build and environment can be better documented together',
            recommendation: 'Create unified dev setup guide',
          },
        ],
        tech_debt_score: 32,
      },
      improvement_roadmap: {
        quick_wins: [
          { pillar: 'Security', action: 'Add SECURITY.md', impact: 'high', effort: 'low' },
        ],
        short_term: [
          {
            pillar: 'Build System',
            action: 'Document build targets',
            impact: 'medium',
            effort: 'medium',
          },
        ],
        medium_term: [
          {
            pillar: 'Environment',
            action: 'Improve devcontainer',
            impact: 'medium',
            effort: 'medium',
          },
        ],
        long_term: [
          { pillar: 'Observability', action: 'Add telemetry guide', impact: 'low', effort: 'high' },
        ],
      },
      charts: makeCharts(STREAMLIT_PILLARS, 3, 54),
    },
  },
  {
    id: 'gh-cli',
    name: 'GitHub CLI',
    fullName: 'cli/cli',
    language: 'Go',
    level: 3,
    score: 48,
    description: 'GitHub official command line tool for seamless workflows.',
    stars: 38200,
    url: 'https://github.com/cli/cli',
    scanResult: {
      meta: {
        repo: 'cli/cli',
        commit: 't6u7v8w',
        timestamp: '2024-01-15T15:00:00Z',
        scan_duration_ms: 25000,
        agents_used: 9,
      },
      executive_summary: {
        level: 3,
        score: 48,
        headline: 'GitHub CLI has solid foundations but needs better agent-facing documentation.',
        key_strengths: ['Clean codebase', 'Good test structure', 'Clear release process'],
        critical_gaps: ['Missing architecture docs', 'No AGENTS.md', 'Observability absent'],
        next_steps: [
          'Add architecture documentation',
          'Create AGENTS.md',
          'Document extension points',
        ],
      },
      detailed_analysis: {
        pillars: GHCLI_PILLARS,
        cross_pillar_insights: [
          {
            type: 'risk',
            pillars: ['observability', 'product'],
            insight: 'Limited visibility into CLI usage patterns',
            recommendation: 'Consider opt-in telemetry',
          },
        ],
        tech_debt_score: 38,
      },
      improvement_roadmap: {
        quick_wins: [
          { pillar: 'Documentation', action: 'Add AGENTS.md', impact: 'high', effort: 'low' },
        ],
        short_term: [
          {
            pillar: 'Documentation',
            action: 'Add architecture docs',
            impact: 'high',
            effort: 'medium',
          },
        ],
        medium_term: [
          { pillar: 'Environment', action: 'Add devcontainer', impact: 'medium', effort: 'medium' },
        ],
        long_term: [
          {
            pillar: 'Observability',
            action: 'Add optional telemetry',
            impact: 'medium',
            effort: 'high',
          },
        ],
      },
      charts: makeCharts(GHCLI_PILLARS, 3, 48),
    },
  },
  {
    id: 'flask',
    name: 'Flask',
    fullName: 'pallets/flask',
    language: 'Python',
    level: 2,
    score: 37,
    description: 'Lightweight WSGI web application framework.',
    stars: 68700,
    url: 'https://github.com/pallets/flask',
    scanResult: {
      meta: {
        repo: 'pallets/flask',
        commit: 'x9y0z1a',
        timestamp: '2024-01-15T16:00:00Z',
        scan_duration_ms: 22000,
        agents_used: 9,
      },
      executive_summary: {
        level: 2,
        score: 37,
        headline: 'Flask is a mature project but lacks modern agent readiness features.',
        key_strengths: ['Stable and well-tested', 'Extensive documentation', 'Large community'],
        critical_gaps: [
          'No AGENTS.md',
          'Limited CI visibility',
          'No devcontainer',
          'No observability',
        ],
        next_steps: [
          'Add AGENTS.md',
          'Modernize CI documentation',
          'Add development environment guide',
        ],
      },
      detailed_analysis: {
        pillars: FLASK_PILLARS,
        cross_pillar_insights: [
          {
            type: 'risk',
            pillars: ['environment', 'observability'],
            insight: 'Modern development practices are lacking',
            recommendation: 'Prioritize developer experience improvements',
          },
        ],
        tech_debt_score: 45,
      },
      improvement_roadmap: {
        quick_wins: [
          { pillar: 'Documentation', action: 'Add AGENTS.md', impact: 'high', effort: 'low' },
        ],
        short_term: [
          { pillar: 'Environment', action: 'Add devcontainer', impact: 'high', effort: 'medium' },
        ],
        medium_term: [
          {
            pillar: 'Build System',
            action: 'Document CI/CD pipeline',
            impact: 'medium',
            effort: 'medium',
          },
        ],
        long_term: [
          {
            pillar: 'Observability',
            action: 'Add logging best practices',
            impact: 'medium',
            effort: 'medium',
          },
        ],
      },
      charts: makeCharts(FLASK_PILLARS, 2, 37),
    },
  },
  {
    id: 'express',
    name: 'Express',
    fullName: 'expressjs/express',
    language: 'TypeScript',
    level: 2,
    score: 28,
    description: 'Fast, unopinionated, minimalist web framework for Node.js.',
    stars: 66100,
    url: 'https://github.com/expressjs/express',
    scanResult: {
      meta: {
        repo: 'expressjs/express',
        commit: 'b2c3d4e',
        timestamp: '2024-01-15T17:00:00Z',
        scan_duration_ms: 20000,
        agents_used: 9,
      },
      executive_summary: {
        level: 2,
        score: 28,
        headline:
          'Express is a foundational project that needs modernization for AI agent workflows.',
        key_strengths: ['Battle-tested codebase', 'Simple API', 'Huge ecosystem'],
        critical_gaps: [
          'Minimal documentation for contributors',
          'No AGENTS.md',
          'No devcontainer',
          'No observability',
          'No task templates',
        ],
        next_steps: [
          'Add comprehensive contributor guide',
          'Create AGENTS.md',
          'Modernize development setup',
        ],
      },
      detailed_analysis: {
        pillars: EXPRESS_PILLARS,
        cross_pillar_insights: [
          {
            type: 'risk',
            pillars: ['documentation', 'task_discovery'],
            insight: 'Contributor onboarding is difficult',
            recommendation: 'Create comprehensive contributor documentation',
          },
          {
            type: 'opportunity',
            pillars: ['environment', 'build'],
            insight: 'Modernizing dev setup would greatly help AI agents',
            recommendation: 'Add Docker-based development',
          },
        ],
        tech_debt_score: 55,
      },
      improvement_roadmap: {
        quick_wins: [
          { pillar: 'Documentation', action: 'Add AGENTS.md', impact: 'high', effort: 'low' },
          {
            pillar: 'Task Discovery',
            action: 'Add issue templates',
            impact: 'medium',
            effort: 'low',
          },
        ],
        short_term: [
          {
            pillar: 'Documentation',
            action: 'Expand contributor guide',
            impact: 'high',
            effort: 'medium',
          },
        ],
        medium_term: [
          { pillar: 'Environment', action: 'Add devcontainer', impact: 'high', effort: 'medium' },
        ],
        long_term: [
          {
            pillar: 'Observability',
            action: 'Document logging patterns',
            impact: 'medium',
            effort: 'medium',
          },
        ],
      },
      charts: makeCharts(EXPRESS_PILLARS, 2, 28),
    },
  },
];
