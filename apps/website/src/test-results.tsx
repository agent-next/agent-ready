/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ResultsView } from './components/ResultsView';
import type { ScanResult } from './api/scan';
import './index.css';

// Mock data for testing
const mockResult: ScanResult = {
  meta: {
    repo: 'upki-ai/agent-ready',
    commit: 'abc1234567890',
    timestamp: new Date().toISOString(),
    scan_duration_ms: 2453,
    agents_used: 3,
  },
  executive_summary: {
    level: 3,
    score: 72,
    headline: 'Good foundation with room for improvement',
    key_strengths: [
      'Comprehensive documentation',
      'Strong testing coverage',
      'Well-defined CI/CD pipeline',
    ],
    critical_gaps: [
      'Missing AGENTS.md file',
      'No observability framework',
      'Security scanning not configured',
    ],
    next_steps: [
      'Add AGENTS.md with AI agent instructions',
      'Configure structured logging with pino or winston',
      'Set up Dependabot for security alerts',
    ],
  },
  detailed_analysis: {
    pillars: [
      {
        pillar: 'documentation',
        level_achieved: 4,
        score: 85,
        icon: '📖',
        name: 'Documentation',
        checks_passed: 8,
        checks_total: 10,
      },
      {
        pillar: 'code_style',
        level_achieved: 3,
        score: 75,
        icon: '✨',
        name: 'Code Style',
        checks_passed: 6,
        checks_total: 8,
      },
      {
        pillar: 'build_system',
        level_achieved: 4,
        score: 90,
        icon: '🔧',
        name: 'Build System',
        checks_passed: 9,
        checks_total: 10,
      },
      {
        pillar: 'testing',
        level_achieved: 3,
        score: 70,
        icon: '🧪',
        name: 'Testing',
        checks_passed: 7,
        checks_total: 10,
      },
      {
        pillar: 'security',
        level_achieved: 2,
        score: 55,
        icon: '🔒',
        name: 'Security',
        checks_passed: 5,
        checks_total: 9,
      },
      {
        pillar: 'observability',
        level_achieved: 1,
        score: 40,
        icon: '📊',
        name: 'Observability',
        checks_passed: 3,
        checks_total: 8,
      },
      {
        pillar: 'environment',
        level_achieved: 3,
        score: 65,
        icon: '🌍',
        name: 'Environment',
        checks_passed: 5,
        checks_total: 8,
      },
      {
        pillar: 'task_discovery',
        level_achieved: 3,
        score: 80,
        icon: '📋',
        name: 'Task Discovery',
        checks_passed: 8,
        checks_total: 10,
      },
      {
        pillar: 'product',
        level_achieved: 2,
        score: 50,
        icon: '🚀',
        name: 'Product',
        checks_passed: 4,
        checks_total: 8,
      },
    ],
    cross_pillar_insights: [
      {
        type: 'risk',
        pillars: ['security', 'observability'],
        insight:
          'Low security and observability scores create blind spots for detecting and responding to issues.',
        recommendation:
          'Prioritize setting up security scanning and logging before adding new features.',
      },
      {
        type: 'opportunity',
        pillars: ['documentation', 'build_system'],
        insight: 'Strong documentation and build system create a solid foundation for automation.',
        recommendation:
          'Leverage existing CI/CD to add automated security checks and test coverage reports.',
      },
      {
        type: 'strength',
        pillars: ['documentation', 'task_discovery'],
        insight:
          'Excellent issue templates and documentation make it easy for AI agents to understand the project.',
        recommendation: 'Add AGENTS.md to provide specific instructions for AI coding assistants.',
      },
    ],
    tech_debt_score: 28,
  },
  improvement_roadmap: {
    quick_wins: [
      { pillar: 'documentation', action: 'Create AGENTS.md file', impact: 'high', effort: 'low' },
      { pillar: 'security', action: 'Enable Dependabot alerts', impact: 'high', effort: 'low' },
      {
        pillar: 'observability',
        action: 'Add console.log structured logging',
        impact: 'medium',
        effort: 'low',
      },
    ],
    short_term: [
      {
        pillar: 'security',
        action: 'Add CodeQL security scanning',
        impact: 'high',
        effort: 'medium',
      },
      {
        pillar: 'testing',
        action: 'Increase test coverage to 80%',
        impact: 'high',
        effort: 'medium',
      },
      {
        pillar: 'observability',
        action: 'Configure error tracking with Sentry',
        impact: 'medium',
        effort: 'medium',
      },
    ],
    medium_term: [
      {
        pillar: 'environment',
        action: 'Create devcontainer configuration',
        impact: 'medium',
        effort: 'medium',
      },
      {
        pillar: 'product',
        action: 'Implement feature flags system',
        impact: 'medium',
        effort: 'high',
      },
    ],
    long_term: [
      {
        pillar: 'observability',
        action: 'Set up distributed tracing',
        impact: 'medium',
        effort: 'high',
      },
      {
        pillar: 'product',
        action: 'Implement usage analytics dashboard',
        impact: 'low',
        effort: 'high',
      },
    ],
  },
  charts: {
    pillar_radar: [
      { pillar: 'documentation', score: 85 },
      { pillar: 'code_style', score: 75 },
      { pillar: 'build_system', score: 90 },
      { pillar: 'testing', score: 70 },
      { pillar: 'security', score: 55 },
      { pillar: 'observability', score: 40 },
      { pillar: 'environment', score: 65 },
      { pillar: 'task_discovery', score: 80 },
      { pillar: 'product', score: 50 },
    ],
    level_progress: [
      { level: 1, achieved: true, score: 95 },
      { level: 2, achieved: true, score: 88 },
      { level: 3, achieved: true, score: 82 },
      { level: 4, achieved: false, score: 65 },
      { level: 5, achieved: false, score: 42 },
    ],
  },
};

function TestApp() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-secondary border-b border-border-light p-4">
        <h1 className="text-2xl font-bold text-center text-text-primary">ResultsView Test Page</h1>
        <p className="text-center text-text-secondary mt-2">
          Testing D3.js visualizations and new report sections
        </p>
      </header>
      <ResultsView result={mockResult} onReset={() => window.location.reload()} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
