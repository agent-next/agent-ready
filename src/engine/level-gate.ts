/**
 * Level gating logic
 *
 * Implements the Factory.ai 80% rule for level achievement:
 * - Level N achieved when:
 *   1. ALL required checks in level N pass
 *   2. >= 80% of ALL checks in PREVIOUS level (N-1) pass (Factory spec)
 *   3. All previous levels (1 to N-1) already achieved
 *
 * Note: L1 has no previous level, so only requires its own checks to pass.
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

    // Note: 'achieved' here is a per-level summary stat
    // The actual gating logic (Factory 80% rule on PREVIOUS level) is in determineAchievedLevel
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
 * Determine the highest achieved level using Factory.ai gating rules
 *
 * Factory.ai 80% Rule:
 * - To unlock Level N, you must pass 80% of criteria from PREVIOUS level (N-1)
 * - AND all required checks at Level N must pass
 *
 * Example:
 * - L1: All required L1 checks pass → L1 achieved (no previous level gating)
 * - L2: 80% of L1 checks pass + all required L2 checks pass → L2 achieved
 * - L3: 80% of L2 checks pass + all required L3 checks pass → L3 achieved
 *
 * Empty Level Behavior:
 * - If a level has no checks, it's auto-achieved if previous levels passed
 * - If PREVIOUS level is empty, the gating threshold is considered met
 */
export function determineAchievedLevel(levelSummaries: Record<Level, LevelSummary>): Level | null {
  const levels = LEVELS;
  let highestAchieved: Level | null = null;

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    const summary = levelSummaries[level];

    // Get previous level summary for gating (Factory 80% rule)
    const prevLevel = i > 0 ? levels[i - 1] : null;
    const prevSummary = prevLevel ? levelSummaries[prevLevel] : null;

    // Empty levels are auto-achieved if previous levels passed
    if (summary.checks_total === 0) {
      if (highestAchieved !== null || level === 'L1') {
        highestAchieved = level;
        continue;
      }
      break; // Can't achieve empty level without previous levels
    }

    // Check 1: All required checks at THIS level must pass
    const allRequiredPass = summary.required_passed === summary.required_total;

    // Check 2: Factory 80% rule - 80% of PREVIOUS level must pass
    // For L1, there's no previous level, so this is automatically true
    let prevLevelGatePasses = true;
    if (prevSummary && prevSummary.checks_total > 0) {
      const prevLevelScore = prevSummary.checks_passed / prevSummary.checks_total;
      prevLevelGatePasses = prevLevelScore >= PASSING_THRESHOLD;
    }

    // Level is achieved if both conditions are met
    if (allRequiredPass && prevLevelGatePasses) {
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
 * Uses Factory.ai 80% rule on PREVIOUS level
 */
function determinePillarLevel(results: CheckResult[]): Level | null {
  const levels = LEVELS;
  let highestAchieved: Level | null = null;

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    const levelResults = results.filter((r) => r.level === level);

    // Get previous level results for gating
    const prevLevel = i > 0 ? levels[i - 1] : null;
    const prevResults = prevLevel ? results.filter((r) => r.level === prevLevel) : [];

    if (levelResults.length === 0) {
      // No checks at this level for this pillar
      if (highestAchieved !== null || level === 'L1') {
        highestAchieved = level;
        continue;
      }
      break;
    }

    // Check 1: All required checks at THIS level must pass
    const requiredResults = levelResults.filter((r) => r.required);
    const requiredPassed = requiredResults.filter((r) => r.passed).length;
    const allRequiredPass = requiredPassed === requiredResults.length;

    // Check 2: Factory 80% rule - 80% of PREVIOUS level must pass
    let prevLevelGatePasses = true;
    if (prevResults.length > 0) {
      const prevPassed = prevResults.filter((r) => r.passed).length;
      prevLevelGatePasses = prevPassed / prevResults.length >= PASSING_THRESHOLD;
    }

    if (allRequiredPass && prevLevelGatePasses) {
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
