/**
 * git_freshness check implementation
 *
 * Checks if a file has been modified within a specified time period
 * using git commit history. This is used for documentation freshness checks.
 */

import * as path from 'node:path';
import type { CheckResult, ScanContext, Pillar, Level } from '../types.js';
import { gitExec } from '../utils/exec.js';
import { fileExists } from '../utils/fs.js';

/**
 * Git freshness check configuration
 */
export interface GitFreshnessCheck {
  type: 'git_freshness';
  id: string;
  name: string;
  description: string;
  pillar: Pillar;
  level: Level;
  required: boolean;
  path: string; // File or directory to check
  max_days: number; // Maximum days since last modification
}

/**
 * Get the last modification date of a file from git history
 *
 * @param filePath - Relative path to the file
 * @param repoPath - Root path of the repository
 * @returns Date of last modification, or null if not tracked
 */
function getLastModifiedDate(filePath: string, repoPath: string): Date | null {
  // Get the last commit date for the file
  const result = gitExec(['log', '-1', '--format=%aI', '--', filePath], repoPath);

  if (!result.success || !result.stdout) {
    return null;
  }

  const dateStr = result.stdout.trim();
  if (!dateStr) {
    return null;
  }

  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Calculate the number of days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Execute git freshness check
 */
export async function executeGitFreshness(
  check: GitFreshnessCheck,
  context: ScanContext
): Promise<CheckResult> {
  const filePath = path.join(context.root_path, check.path);

  // First check if the file exists
  const exists = await fileExists(filePath);
  if (!exists) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: false,
      required: check.required,
      message: `File not found: ${check.path}`,
      suggestions: [`Create ${check.path}`],
    };
  }

  // Get last modification date from git
  const lastModified = getLastModifiedDate(check.path, context.root_path);

  if (!lastModified) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: false,
      required: check.required,
      message: `File ${check.path} is not tracked by git or has no commit history`,
      suggestions: [`Commit ${check.path} to git to track its history`],
    };
  }

  const now = new Date();
  const daysSinceModified = daysBetween(lastModified, now);

  if (daysSinceModified <= check.max_days) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: true,
      required: check.required,
      message: `File ${check.path} was modified ${daysSinceModified} days ago (within ${check.max_days} day limit)`,
      matched_files: [check.path],
      details: {
        last_modified: lastModified.toISOString(),
        days_since_modified: daysSinceModified,
        max_days: check.max_days,
      },
    };
  }

  return {
    check_id: check.id,
    check_name: check.name,
    pillar: check.pillar,
    level: check.level,
    passed: false,
    required: check.required,
    message: `File ${check.path} was last modified ${daysSinceModified} days ago (exceeds ${check.max_days} day limit)`,
    suggestions: [
      `Review and update ${check.path} to ensure it reflects current state`,
      `Last modification: ${lastModified.toLocaleDateString()}`,
    ],
    details: {
      last_modified: lastModified.toISOString(),
      days_since_modified: daysSinceModified,
      max_days: check.max_days,
    },
  };
}
