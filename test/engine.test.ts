/**
 * Tests for scan engine and level gating
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';

import {
  calculateLevelSummaries,
  determineAchievedLevel,
  calculateProgressToNext,
  calculateOverallScore,
} from '../src/engine/level-gate.js';
import type { CheckResult, CheckConfig, Level } from '../src/types.js';

// Helper to create check configs
function makeCheck(id: string, level: Level, required: boolean): CheckConfig {
  return {
    id,
    name: id,
    description: 'Test',
    type: 'file_exists',
    pillar: 'docs',
    level,
    required,
    path: 'test.md',
  } as CheckConfig;
}

// Helper to create check results
function makeResult(id: string, level: Level, passed: boolean, required: boolean): CheckResult {
  return {
    check_id: id,
    check_name: id,
    pillar: 'docs',
    level,
    passed,
    required,
    message: passed ? 'Passed' : 'Failed',
  };
}

describe('calculateLevelSummaries', () => {
  it('should calculate correct summaries for each level', () => {
    const checks: CheckConfig[] = [
      makeCheck('c1', 'L1', true),
      makeCheck('c2', 'L1', false),
      makeCheck('c3', 'L2', true),
      makeCheck('c4', 'L2', false),
    ];

    const results: CheckResult[] = [
      makeResult('c1', 'L1', true, true),
      makeResult('c2', 'L1', true, false),
      makeResult('c3', 'L2', true, true),
      makeResult('c4', 'L2', false, false),
    ];

    const summaries = calculateLevelSummaries(results, checks);

    // L1: 2/2 passed = 100%
    assert.strictEqual(summaries.L1.checks_passed, 2);
    assert.strictEqual(summaries.L1.checks_total, 2);
    assert.strictEqual(summaries.L1.score, 100);
    assert.strictEqual(summaries.L1.achieved, true);

    // L2: 1/2 passed = 50% (below 80% threshold)
    assert.strictEqual(summaries.L2.checks_passed, 1);
    assert.strictEqual(summaries.L2.checks_total, 2);
    assert.strictEqual(summaries.L2.score, 50);
    assert.strictEqual(summaries.L2.achieved, false);
  });

  it('should mark level as not achieved when required check fails', () => {
    const checks: CheckConfig[] = [
      makeCheck('c1', 'L1', true),
      makeCheck('c2', 'L1', false),
      makeCheck('c3', 'L1', false),
      makeCheck('c4', 'L1', false),
      makeCheck('c5', 'L1', false),
    ];

    // 4/5 pass (80%) but required fails
    const results: CheckResult[] = [
      makeResult('c1', 'L1', false, true), // Required fails
      makeResult('c2', 'L1', true, false),
      makeResult('c3', 'L1', true, false),
      makeResult('c4', 'L1', true, false),
      makeResult('c5', 'L1', true, false),
    ];

    const summaries = calculateLevelSummaries(results, checks);

    assert.strictEqual(summaries.L1.score, 80);
    assert.strictEqual(summaries.L1.achieved, false); // Required failed
  });
});

describe('determineAchievedLevel', () => {
  it('should return highest achieved level sequentially', () => {
    const summaries = {
      L1: {
        level: 'L1' as Level,
        achieved: true,
        score: 100,
        checks_passed: 2,
        checks_total: 2,
        required_passed: 1,
        required_total: 1,
      },
      L2: {
        level: 'L2' as Level,
        achieved: true,
        score: 85,
        checks_passed: 3,
        checks_total: 3,
        required_passed: 1,
        required_total: 1,
      },
      L3: {
        level: 'L3' as Level,
        achieved: false,
        score: 50,
        checks_passed: 1,
        checks_total: 2,
        required_passed: 0,
        required_total: 1,
      },
      L4: {
        level: 'L4' as Level,
        achieved: false,
        score: 0,
        checks_passed: 0,
        checks_total: 1,
        required_passed: 0,
        required_total: 0,
      },
      L5: {
        level: 'L5' as Level,
        achieved: false,
        score: 0,
        checks_passed: 0,
        checks_total: 1,
        required_passed: 0,
        required_total: 0,
      },
    };

    const level = determineAchievedLevel(summaries);
    assert.strictEqual(level, 'L2');
  });

  it('should return null when L1 not achieved', () => {
    const summaries = {
      L1: {
        level: 'L1' as Level,
        achieved: false,
        score: 50,
        checks_passed: 1,
        checks_total: 2,
        required_passed: 0,
        required_total: 1,
      },
      L2: {
        level: 'L2' as Level,
        achieved: true,
        score: 100,
        checks_passed: 2,
        checks_total: 2,
        required_passed: 1,
        required_total: 1,
      },
      L3: {
        level: 'L3' as Level,
        achieved: false,
        score: 0,
        checks_passed: 0,
        checks_total: 0,
        required_passed: 0,
        required_total: 0,
      },
      L4: {
        level: 'L4' as Level,
        achieved: false,
        score: 0,
        checks_passed: 0,
        checks_total: 0,
        required_passed: 0,
        required_total: 0,
      },
      L5: {
        level: 'L5' as Level,
        achieved: false,
        score: 0,
        checks_passed: 0,
        checks_total: 0,
        required_passed: 0,
        required_total: 0,
      },
    };

    const level = determineAchievedLevel(summaries);
    assert.strictEqual(level, null);
  });

  it('should skip levels with no checks', () => {
    const summaries = {
      L1: {
        level: 'L1' as Level,
        achieved: true,
        score: 100,
        checks_passed: 2,
        checks_total: 2,
        required_passed: 1,
        required_total: 1,
      },
      L2: {
        level: 'L2' as Level,
        achieved: true,
        score: 0,
        checks_passed: 0,
        checks_total: 0,
        required_passed: 0,
        required_total: 0,
      }, // No checks
      L3: {
        level: 'L3' as Level,
        achieved: true,
        score: 100,
        checks_passed: 1,
        checks_total: 1,
        required_passed: 0,
        required_total: 0,
      },
      L4: {
        level: 'L4' as Level,
        achieved: false,
        score: 0,
        checks_passed: 0,
        checks_total: 1,
        required_passed: 0,
        required_total: 1, // Required check fails, blocking L4 achievement
      },
      L5: {
        level: 'L5' as Level,
        achieved: false,
        score: 0,
        checks_passed: 0,
        checks_total: 0,
        required_passed: 0,
        required_total: 0,
      },
    };

    const level = determineAchievedLevel(summaries);
    assert.strictEqual(level, 'L3');
  });
});

describe('calculateProgressToNext', () => {
  it('should calculate progress correctly', () => {
    const summaries = {
      L1: {
        level: 'L1' as Level,
        achieved: true,
        score: 100,
        checks_passed: 2,
        checks_total: 2,
        required_passed: 1,
        required_total: 1,
      },
      L2: {
        level: 'L2' as Level,
        achieved: false,
        score: 60,
        checks_passed: 3,
        checks_total: 5,
        required_passed: 1,
        required_total: 1,
      },
      L3: {
        level: 'L3' as Level,
        achieved: false,
        score: 0,
        checks_passed: 0,
        checks_total: 2,
        required_passed: 0,
        required_total: 0,
      },
      L4: {
        level: 'L4' as Level,
        achieved: false,
        score: 0,
        checks_passed: 0,
        checks_total: 0,
        required_passed: 0,
        required_total: 0,
      },
      L5: {
        level: 'L5' as Level,
        achieved: false,
        score: 0,
        checks_passed: 0,
        checks_total: 0,
        required_passed: 0,
        required_total: 0,
      },
    };

    const progress = calculateProgressToNext('L1', summaries);
    assert.strictEqual(progress, 0.6); // 3/5
  });

  it('should return 1.0 when at max level', () => {
    const summaries = {
      L1: {
        level: 'L1' as Level,
        achieved: true,
        score: 100,
        checks_passed: 1,
        checks_total: 1,
        required_passed: 1,
        required_total: 1,
      },
      L2: {
        level: 'L2' as Level,
        achieved: true,
        score: 100,
        checks_passed: 1,
        checks_total: 1,
        required_passed: 1,
        required_total: 1,
      },
      L3: {
        level: 'L3' as Level,
        achieved: true,
        score: 100,
        checks_passed: 1,
        checks_total: 1,
        required_passed: 1,
        required_total: 1,
      },
      L4: {
        level: 'L4' as Level,
        achieved: true,
        score: 100,
        checks_passed: 1,
        checks_total: 1,
        required_passed: 1,
        required_total: 1,
      },
      L5: {
        level: 'L5' as Level,
        achieved: true,
        score: 100,
        checks_passed: 1,
        checks_total: 1,
        required_passed: 1,
        required_total: 1,
      },
    };

    const progress = calculateProgressToNext('L5', summaries);
    assert.strictEqual(progress, 1.0);
  });
});

describe('calculateOverallScore', () => {
  it('should calculate percentage correctly', () => {
    const results: CheckResult[] = [
      makeResult('c1', 'L1', true, true),
      makeResult('c2', 'L1', true, false),
      makeResult('c3', 'L2', false, false),
      makeResult('c4', 'L2', false, false),
    ];

    const score = calculateOverallScore(results);
    assert.strictEqual(score, 50); // 2/4
  });

  it('should return 0 for empty results', () => {
    const score = calculateOverallScore([]);
    assert.strictEqual(score, 0);
  });
});
