/**
 * Tests for output formatters
 */

import { describe, it, beforeEach } from 'node:test';
import * as assert from 'node:assert';

import { formatJson } from '../src/output/json.js';
import { outputMarkdown } from '../src/output/markdown.js';
import { setLocale } from '../src/i18n/index.js';
import type {
  ScanResult,
  PillarSummary,
  ActionItem,
  Level,
  Pillar,
  LevelSummary,
  CheckResult,
  ProjectType,
} from '../src/types.js';

function createMockPillarSummary(
  pillar: Pillar,
  level: Level | null,
  score: number,
  passed: number,
  total: number
): PillarSummary {
  return {
    pillar,
    name: pillar,
    level_achieved: level,
    score,
    checks_passed: passed,
    checks_total: total,
    failed_checks: [],
  };
}

function createMockLevelSummary(
  level: Level,
  achieved: boolean,
  score: number,
  passed: number,
  total: number,
  reqPassed: number,
  reqTotal: number
): LevelSummary {
  return {
    level,
    achieved,
    score,
    checks_passed: passed,
    checks_total: total,
    required_passed: reqPassed,
    required_total: reqTotal,
  };
}

function createMockScanResult(): ScanResult {
  const pillars: Record<Pillar, PillarSummary> = {
    docs: createMockPillarSummary('docs', 'L3', 80, 4, 5),
    style: createMockPillarSummary('style', 'L2', 75, 3, 4),
    build: createMockPillarSummary('build', 'L3', 100, 5, 5),
    test: createMockPillarSummary('test', 'L2', 66, 2, 3),
    security: createMockPillarSummary('security', 'L3', 100, 4, 4),
    observability: createMockPillarSummary('observability', 'L3', 100, 3, 3),
    env: createMockPillarSummary('env', 'L2', 66, 2, 3),
    task_discovery: createMockPillarSummary('task_discovery', 'L3', 100, 2, 2),
    product: createMockPillarSummary('product', null, 0, 0, 3),
  };

  const levels: Record<Level, LevelSummary> = {
    L1: createMockLevelSummary('L1', true, 100, 5, 5, 2, 2),
    L2: createMockLevelSummary('L2', true, 85, 8, 10, 3, 3),
    L3: createMockLevelSummary('L3', false, 60, 6, 10, 1, 2),
    L4: createMockLevelSummary('L4', false, 20, 1, 5, 0, 1),
    L5: createMockLevelSummary('L5', false, 0, 0, 3, 0, 0),
  };

  const action_items: ActionItem[] = [
    {
      check_id: 'docs.api',
      pillar: 'docs',
      level: 'L3',
      priority: 'high',
      action: 'Create API documentation',
    },
    {
      check_id: 'env.docker',
      pillar: 'env',
      level: 'L3',
      priority: 'medium',
      action: 'Create docker-compose.yml',
    },
    {
      check_id: 'product.feature_flags',
      pillar: 'product',
      level: 'L4',
      priority: 'low',
      action: 'Add feature flag system',
    },
  ];

  const check_results: CheckResult[] = [
    {
      check_id: 'docs.readme',
      check_name: 'README.md exists',
      pillar: 'docs',
      level: 'L1',
      passed: true,
      required: true,
      message: 'README.md found',
    },
  ];

  const failed_checks: CheckResult[] = [];

  return {
    repo: 'test/repo',
    commit: 'abc123',
    timestamp: '2024-01-15T10:00:00Z',
    profile: 'factory_compat',
    profile_version: '1.0.0',
    level: 'L2' as Level,
    progress_to_next: 0.6,
    overall_score: 76,
    pillars,
    levels,
    check_results,
    failed_checks,
    action_items,
    is_monorepo: false,
    project_type: {
      type: 'library',
      confidence: 'medium',
      indicators: ['package.json has main field'],
    },
    checks_skipped_by_type: 0,
  };
}

describe('JSON output formatter', () => {
  it('should produce valid JSON', () => {
    const result = createMockScanResult();
    const output = formatJson(result);

    assert.doesNotThrow(() => JSON.parse(output), 'Should be valid JSON');
  });

  it('should include all required fields', () => {
    const result = createMockScanResult();
    const output = formatJson(result);
    const parsed = JSON.parse(output);

    assert.ok('repo' in parsed, 'Should have repo');
    assert.ok('level' in parsed, 'Should have level');
    assert.ok('overall_score' in parsed, 'Should have overall_score');
    assert.ok('pillars' in parsed, 'Should have pillars');
    assert.ok('action_items' in parsed, 'Should have action_items');
  });

  it('should include pillar details', () => {
    const result = createMockScanResult();
    const output = formatJson(result);
    const parsed = JSON.parse(output);

    const pillars = parsed.pillars;
    assert.ok(pillars, 'Should have pillars object');
    assert.ok('docs' in pillars, 'Should have docs pillar');
    assert.ok('build' in pillars, 'Should have build pillar');
  });

  it('should include action items array', () => {
    const result = createMockScanResult();
    const output = formatJson(result);
    const parsed = JSON.parse(output);

    const actionItems = parsed.action_items;
    assert.ok(Array.isArray(actionItems), 'Action items should be array');
    assert.ok(actionItems.length > 0, 'Should have action items');
  });

  it('should include timestamp', () => {
    const result = createMockScanResult();
    const output = formatJson(result);
    const parsed = JSON.parse(output);

    assert.ok('timestamp' in parsed, 'Should have timestamp');
  });

  it('should have consistent output format', () => {
    const result = createMockScanResult();
    const output1 = formatJson(result);
    const output2 = formatJson(result);

    // Same input should produce same output (deterministic)
    assert.strictEqual(output1, output2, 'Should be deterministic');
  });

  it('should include level details', () => {
    const result = createMockScanResult();
    const output = formatJson(result);
    const parsed = JSON.parse(output);

    assert.ok('levels' in parsed, 'Should have levels');
    assert.ok('L1' in parsed.levels, 'Should have L1 level');
    assert.ok('L2' in parsed.levels, 'Should have L2 level');
  });

  it('should have correct score', () => {
    const result = createMockScanResult();
    const output = formatJson(result);
    const parsed = JSON.parse(output);

    assert.strictEqual(parsed.overall_score, 76, 'Should have correct score');
  });

  it('should have correct level', () => {
    const result = createMockScanResult();
    const output = formatJson(result);
    const parsed = JSON.parse(output);

    assert.strictEqual(parsed.level, 'L2', 'Should have correct level');
  });
});

describe('Markdown output formatter', () => {
  beforeEach(() => setLocale('en'));

  it('should execute without error', () => {
    const result = createMockScanResult();

    // Mock console.log to prevent actual output during tests
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (msg: string = '') => logs.push(msg);

    try {
      outputMarkdown(result, false);
      assert.ok(logs.length > 0, 'Should produce some output');
    } finally {
      console.log = originalLog;
    }
  });

  it('should include repository info in output', () => {
    const result = createMockScanResult();

    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (msg: string = '') => logs.push(msg);

    try {
      outputMarkdown(result, false);
      const fullOutput = logs.join('\n');
      assert.ok(fullOutput.includes('test/repo'), 'Should include repo name');
    } finally {
      console.log = originalLog;
    }
  });

  it('should include commit in output', () => {
    const result = createMockScanResult();

    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (msg: string = '') => logs.push(msg);

    try {
      outputMarkdown(result, false);
      const fullOutput = logs.join('\n');
      assert.ok(fullOutput.includes('abc123'), 'Should include commit');
    } finally {
      console.log = originalLog;
    }
  });

  it('should produce more output in verbose mode', () => {
    const result = createMockScanResult();

    const normalLogs: string[] = [];
    const verboseLogs: string[] = [];
    const originalLog = console.log;

    console.log = (msg: string = '') => normalLogs.push(msg);
    outputMarkdown(result, false);

    console.log = (msg: string = '') => verboseLogs.push(msg);
    outputMarkdown(result, true);

    console.log = originalLog;

    // Verbose output should be at least as long
    assert.ok(
      verboseLogs.join('').length >= normalLogs.join('').length,
      'Verbose should produce at least as much output'
    );
  });
});

describe('Output format consistency', () => {
  it('should have same level in JSON', () => {
    const result = createMockScanResult();
    const json = formatJson(result);
    const parsed = JSON.parse(json);

    assert.strictEqual(parsed.level, 'L2', 'Should have L2 level');
  });

  it('should have same score in JSON', () => {
    const result = createMockScanResult();
    const json = formatJson(result);
    const parsed = JSON.parse(json);

    assert.strictEqual(parsed.overall_score, 76, 'Should have score 76');
  });

  it('should have all 9 pillars', () => {
    const result = createMockScanResult();
    const json = formatJson(result);
    const parsed = JSON.parse(json);

    const expectedPillars = [
      'docs',
      'style',
      'build',
      'test',
      'security',
      'observability',
      'env',
      'task_discovery',
      'product',
    ];

    for (const pillar of expectedPillars) {
      assert.ok(pillar in parsed.pillars, `Should have ${pillar} pillar`);
    }
  });
});
