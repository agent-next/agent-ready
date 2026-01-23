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
import type { CheckResult, Level } from '../src/types.js';

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
    const results: CheckResult[] = [
      makeResult('c1', 'L1', true, true),
      makeResult('c2', 'L1', true, false),
      makeResult('c3', 'L2', true, true),
      makeResult('c4', 'L2', false, false),
    ];

    const summaries = calculateLevelSummaries(results);

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
    // 4/5 pass (80%) but required fails
    const results: CheckResult[] = [
      makeResult('c1', 'L1', false, true), // Required fails
      makeResult('c2', 'L1', true, false),
      makeResult('c3', 'L1', true, false),
      makeResult('c4', 'L1', true, false),
      makeResult('c5', 'L1', true, false),
    ];

    const summaries = calculateLevelSummaries(results);

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

describe('Factory.ai 80% Rule (Previous Level Gating)', () => {
  it('should achieve L2 when 80% of L1 passes and all L2 required pass', () => {
    // L1: 4/5 = 80% (meets threshold)
    // L2: all required pass
    // L3: has required check that fails (blocks progression)
    const summaries = {
      L1: {
        level: 'L1' as Level,
        achieved: true,
        score: 80,
        checks_passed: 4,
        checks_total: 5,
        required_passed: 1,
        required_total: 1,
      },
      L2: {
        level: 'L2' as Level,
        achieved: true,
        score: 100,
        checks_passed: 3,
        checks_total: 3,
        required_passed: 2,
        required_total: 2,
      },
      L3: {
        level: 'L3' as Level,
        achieved: false,
        score: 0,
        checks_passed: 0,
        checks_total: 2,
        required_passed: 0,
        required_total: 1, // Required check fails, blocking L3
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
    assert.strictEqual(level, 'L2');
  });

  it('should NOT achieve L2 when L1 is below 80%', () => {
    // L1: 3/5 = 60% (below 80% threshold)
    // L2: all checks pass, but L1 gate fails
    const summaries = {
      L1: {
        level: 'L1' as Level,
        achieved: false, // 60% < 80%
        score: 60,
        checks_passed: 3,
        checks_total: 5,
        required_passed: 1,
        required_total: 1,
      },
      L2: {
        level: 'L2' as Level,
        achieved: true,
        score: 100,
        checks_passed: 3,
        checks_total: 3,
        required_passed: 2,
        required_total: 2,
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
    // L1 is achieved (required passes), but L2 blocked by L1's 60% score
    assert.strictEqual(level, 'L1');
  });

  it('should achieve L3 when 80% of L2 passes', () => {
    // L1: 100%, L2: 80%, L3: required passes
    const summaries = {
      L1: {
        level: 'L1' as Level,
        achieved: true,
        score: 100,
        checks_passed: 5,
        checks_total: 5,
        required_passed: 1,
        required_total: 1,
      },
      L2: {
        level: 'L2' as Level,
        achieved: true,
        score: 80,
        checks_passed: 4,
        checks_total: 5,
        required_passed: 1,
        required_total: 1,
      },
      L3: {
        level: 'L3' as Level,
        achieved: true,
        score: 50,
        checks_passed: 1,
        checks_total: 2,
        required_passed: 1,
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
        checks_total: 0,
        required_passed: 0,
        required_total: 0,
      },
    };

    const level = determineAchievedLevel(summaries);
    assert.strictEqual(level, 'L3');
  });

  it('should NOT achieve L3 when L2 is below 80%', () => {
    // L1: 100%, L2: 60% (gate fails), L3: all pass
    const summaries = {
      L1: {
        level: 'L1' as Level,
        achieved: true,
        score: 100,
        checks_passed: 5,
        checks_total: 5,
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
        achieved: true,
        score: 100,
        checks_passed: 2,
        checks_total: 2,
        required_passed: 1,
        required_total: 1,
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
    // L2 achieved (required passes), but L3 blocked by L2's 60% score
    assert.strictEqual(level, 'L2');
  });

  it('should pass gate when previous level is empty', () => {
    // L1: 100%, L2: empty (auto-pass gate), L3: required passes
    // L4 has a required check that fails to block further progression
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
        checks_total: 0, // Empty level
        required_passed: 0,
        required_total: 0,
      },
      L3: {
        level: 'L3' as Level,
        achieved: true,
        score: 100,
        checks_passed: 2,
        checks_total: 2,
        required_passed: 1,
        required_total: 1,
      },
      L4: {
        level: 'L4' as Level,
        achieved: false,
        score: 0,
        checks_passed: 0,
        checks_total: 1,
        required_passed: 0,
        required_total: 1, // Required check fails, blocking L4
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
    // L2 empty = auto-achieved, L3 gate passes (L2 empty = gate passes)
    assert.strictEqual(level, 'L3');
  });

  it('L1 has no previous level gate requirement', () => {
    // L1 only requires its own checks to pass
    const summaries = {
      L1: {
        level: 'L1' as Level,
        achieved: true,
        score: 80,
        checks_passed: 4,
        checks_total: 5,
        required_passed: 2,
        required_total: 2,
      },
      L2: {
        level: 'L2' as Level,
        achieved: false,
        score: 0,
        checks_passed: 0,
        checks_total: 3,
        required_passed: 0,
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
    assert.strictEqual(level, 'L1'); // L1 achieved with no previous level
  });
});
