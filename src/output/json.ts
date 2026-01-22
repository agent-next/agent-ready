/**
 * JSON output formatter
 *
 * Writes scan results to readiness.json
 */

import type { ScanResult } from '../types.js';
import { writeFile } from '../utils/fs.js';

/**
 * Write scan results to JSON file
 */
export async function outputJson(result: ScanResult, outputPath: string): Promise<void> {
  // Create a clean output object (remove verbose data)
  const output = {
    repo: result.repo,
    commit: result.commit,
    timestamp: result.timestamp,
    profile: result.profile,
    profile_version: result.profile_version,
    level: result.level,
    progress_to_next: Math.round(result.progress_to_next * 100) / 100,
    overall_score: result.overall_score,
    pillars: Object.fromEntries(
      Object.entries(result.pillars).map(([key, summary]) => [
        key,
        {
          level_achieved: summary.level_achieved,
          score: summary.score,
          checks_passed: summary.checks_passed,
          checks_total: summary.checks_total,
        },
      ])
    ),
    levels: Object.fromEntries(
      Object.entries(result.levels).map(([key, summary]) => [
        key,
        {
          achieved: summary.achieved,
          score: summary.score,
          checks_passed: summary.checks_passed,
          checks_total: summary.checks_total,
        },
      ])
    ),
    failed_checks: result.failed_checks.map((check) => ({
      check_id: check.check_id,
      pillar: check.pillar,
      level: check.level,
      message: check.message,
      required: check.required,
      suggestions: check.suggestions,
    })),
    action_items: result.action_items.map((item) => ({
      priority: item.priority,
      check_id: item.check_id,
      pillar: item.pillar,
      level: item.level,
      action: item.action,
    })),
    is_monorepo: result.is_monorepo,
    apps: result.apps,
  };

  const json = JSON.stringify(output, null, 2);
  await writeFile(outputPath, json);
}

/**
 * Format scan result as JSON string (for stdout)
 */
export function formatJson(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}
