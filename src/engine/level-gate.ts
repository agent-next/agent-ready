/**
 * Level gating logic
 *
 * Implements the 80% rule for level achievement:
 * - Level N achieved when:
 *   1. ALL required checks in level N pass
 *   2. >= 80% of ALL checks in level N pass
 *   3. All previous levels (1 to N-1) already achieved
 */

import type { Level, CheckResult, LevelSummary, PillarSummary, Pillar } from '../types.js';
import { PASSING_THRESHOLD, LEVELS, PILLARS, PILLAR_NAMES } from '../types.js';

/**
 * Calculate level summaries from check results
 */
export function calculateLevelSummaries(results: CheckResult[]): Record<Level, LevelSummary> {
  const summaries: Record<Level, LevelSummary> = {} as Record<Level, LevelSummary>;
  const levels = LEVELS;

  for (const level of levels) {
    const levelResults = results.filter((r) => r.level === level);

    const totalCount = levelResults.length;
    const passedCount = levelResults.filter((r) => r.passed).length;

    // Get required check results for this level
    const requiredResults = levelResults.filter((r) => r.required);
    const requiredPassed = requiredResults.filter((r) => r.passed).length;
    const requiredTotal = requiredResults.length;

    const score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

    // Level achieved if:
    // 1. All required checks pass
    // 2. Score >= 80%
    const allRequiredPass = requiredPassed === requiredTotal;
    const meetsThreshold = totalCount === 0 || passedCount / totalCount >= PASSING_THRESHOLD;
    const achieved = allRequiredPass && meetsThreshold;

    summaries[level] = {
      level,
      achieved,
      score,
      checks_passed: passedCount,
      checks_total: totalCount,
      required_passed: requiredPassed,
      required_total: requiredTotal,
    };
  }

  return summaries;
}

/**
 * Determine the highest achieved level
 *
 * Levels must be achieved in order (can't skip L2 to get L3).
 *
 * IMPORTANT: Empty Level Auto-Achievement Behavior
 * ------------------------------------------------
 * If a level has no checks defined in the profile, it is automatically
 * considered "achieved" IF all previous levels have been achieved.
 *
 * Example with a profile that has no L2 checks:
 * - L1: 5 checks, all pass → L1 achieved
 * - L2: 0 checks → automatically achieved (since L1 passed)
 * - L3: 10 checks, 8 pass → L3 achieved
 * - Result: "Level L3 achieved"
 *
 * This allows profiles to focus on specific levels without requiring
 * checks at every level. However, it means a repo could achieve L3
 * without any L2-specific validation if the profile omits L2 checks.
 *
 * If stricter behavior is needed, ensure your profile defines at least
 * one check for each level you want to gate.
 */
export function determineAchievedLevel(levelSummaries: Record<Level, LevelSummary>): Level | null {
  const levels = LEVELS;
  let highestAchieved: Level | null = null;

  for (const level of levels) {
    const summary = levelSummaries[level];

    // Empty levels are auto-achieved if previous levels passed
    // This allows profiles to skip levels they don't need to check
    if (summary.checks_total === 0) {
      if (highestAchieved !== null || level === 'L1') {
        highestAchieved = level;
        continue;
      }
    }

    if (summary.achieved) {
      highestAchieved = level;
    } else {
      // Stop at first non-achieved level (levels must be sequential)
      break;
    }
  }

  return highestAchieved;
}

/**
 * Calculate progress toward next level
 */
export function calculateProgressToNext(
  currentLevel: Level | null,
  levelSummaries: Record<Level, LevelSummary>
): number {
  const levels = LEVELS;
  const currentIndex = currentLevel ? levels.indexOf(currentLevel) : -1;
  const nextLevel = levels[currentIndex + 1];

  if (!nextLevel) {
    return 1.0; // Already at max level
  }

  const nextSummary = levelSummaries[nextLevel];

  if (nextSummary.checks_total === 0) {
    return 1.0; // No checks for next level
  }

  return nextSummary.checks_passed / nextSummary.checks_total;
}

/**
 * Calculate pillar summaries from check results
 */
export function calculatePillarSummaries(results: CheckResult[]): Record<Pillar, PillarSummary> {
  const summaries: Record<Pillar, PillarSummary> = {} as Record<Pillar, PillarSummary>;

  for (const pillar of PILLARS) {
    const pillarResults = results.filter((r) => r.pillar === pillar);
    const totalCount = pillarResults.length;
    const passedCount = pillarResults.filter((r) => r.passed).length;
    const failedChecks = pillarResults.filter((r) => !r.passed).map((r) => r.check_id);

    const score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 100;

    // Determine highest achieved level for this pillar
    const pillarLevelAchieved = determinePillarLevel(pillarResults);

    summaries[pillar] = {
      pillar,
      name: PILLAR_NAMES[pillar],
      level_achieved: pillarLevelAchieved,
      score,
      checks_passed: passedCount,
      checks_total: totalCount,
      failed_checks: failedChecks,
    };
  }

  return summaries;
}

/**
 * Determine highest achieved level for a specific pillar
 */
function determinePillarLevel(results: CheckResult[]): Level | null {
  const levels = LEVELS;
  let highestAchieved: Level | null = null;

  for (const level of levels) {
    const levelResults = results.filter((r) => r.level === level);

    if (levelResults.length === 0) {
      // No checks at this level for this pillar
      if (highestAchieved !== null || level === 'L1') {
        highestAchieved = level;
        continue;
      }
      break;
    }

    const passed = levelResults.filter((r) => r.passed).length;
    const total = levelResults.length;
    const requiredResults = levelResults.filter((r) => r.required);
    const requiredPassed = requiredResults.filter((r) => r.passed).length;

    const allRequiredPass = requiredPassed === requiredResults.length;
    const meetsThreshold = passed / total >= PASSING_THRESHOLD;

    if (allRequiredPass && meetsThreshold) {
      highestAchieved = level;
    } else {
      break;
    }
  }

  return highestAchieved;
}

/**
 * Calculate overall score (0-100)
 */
export function calculateOverallScore(results: CheckResult[]): number {
  if (results.length === 0) return 0;

  const passed = results.filter((r) => r.passed).length;
  return Math.round((passed / results.length) * 100);
}
