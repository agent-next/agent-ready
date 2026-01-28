/**
 * Main scanner orchestrator
 *
 * Coordinates the scan process: context building, check execution, and result aggregation
 */

import * as path from 'node:path';
import type {
  ScanOptions,
  ScanResult,
  ActionItem,
  ActionPriority,
  CheckResult,
  CheckConfig,
  MonorepoApp,
  ScanContext,
} from './types.js';
import { loadProfile } from './profiles/index.js';
import { buildScanContext } from './engine/context.js';
import {
  calculateLevelSummaries,
  determineAchievedLevel,
  calculateProgressToNext,
  calculatePillarSummaries,
  calculateOverallScore,
} from './engine/level-gate.js';
import { executeChecks } from './checks/index.js';
import { isApplicableToProjectType, getProjectTypeDescription } from './engine/project-type.js';

/**
 * Run a full scan on a repository
 */
export async function scan(options: ScanOptions): Promise<ScanResult> {
  // Load profile
  const profile = await loadProfile(options.profile);

  // Build scan context
  const context = await buildScanContext(options.path);

  // Filter checks by level if specified
  let checksToRun = profile.checks;
  if (options.level) {
    const levelValue = parseInt(options.level.substring(1), 10);
    checksToRun = profile.checks.filter((check) => {
      const checkLevel = parseInt(check.level.substring(1), 10);
      return checkLevel <= levelValue;
    });
  }

  // Filter checks by project type
  const projectType = context.project_type.type;
  const checksBeforeFilter = checksToRun.length;
  checksToRun = filterChecksByProjectType(checksToRun, context);
  const checksSkipped = checksBeforeFilter - checksToRun.length;

  if (options.verbose && checksSkipped > 0) {
    console.log(`Project type: ${getProjectTypeDescription(projectType)} (${projectType})`);
    console.log(`Skipped ${checksSkipped} checks not applicable to this project type`);
  }

  // Execute all checks
  const results = await executeChecks(checksToRun, context);

  // Calculate summaries
  const levelSummaries = calculateLevelSummaries(results);
  const pillarSummaries = calculatePillarSummaries(results);
  const achievedLevel = determineAchievedLevel(levelSummaries);
  const progressToNext = calculateProgressToNext(achievedLevel, levelSummaries);
  const overallScore = calculateOverallScore(results);

  // Get failed checks
  const failedChecks = results.filter((r) => !r.passed);

  // Generate action items
  const actionItems = generateActionItems(failedChecks, checksToRun);

  // Scan monorepo apps if applicable
  let apps: MonorepoApp[] | undefined;
  if (context.is_monorepo && context.monorepo_apps.length > 0) {
    apps = await scanMonorepoApps(context.monorepo_apps, options, checksToRun);
  }

  return {
    repo: context.repo_name,
    commit: context.commit_sha,
    timestamp: new Date().toISOString(),
    profile: profile.name,
    profile_version: profile.version,
    level: achievedLevel,
    progress_to_next: progressToNext,
    overall_score: overallScore,
    pillars: pillarSummaries,
    levels: levelSummaries,
    check_results: results,
    failed_checks: failedChecks,
    action_items: actionItems,
    is_monorepo: context.is_monorepo,
    apps,
    project_type: context.project_type,
    checks_skipped_by_type: checksSkipped,
  };
}

/**
 * Generate prioritized action items from failed checks
 */
function generateActionItems(failedChecks: CheckResult[], checks: CheckConfig[]): ActionItem[] {
  const items: ActionItem[] = [];

  for (const result of failedChecks) {
    const check = checks.find((c) => c.id === result.check_id);
    if (!check) continue;

    const priority = calculatePriority(check);
    const action = result.suggestions?.[0] || `Fix: ${result.message}`;

    items.push({
      priority,
      check_id: result.check_id,
      pillar: result.pillar,
      level: result.level,
      action,
      details: result.message,
      template: getTemplateForCheck(check),
    });
  }

  // Sort by priority (critical > high > medium > low) and level
  const priorityOrder: Record<ActionPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  items.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    const levelA = parseInt(a.level.substring(1), 10);
    const levelB = parseInt(b.level.substring(1), 10);
    return levelA - levelB;
  });

  return items;
}

/**
 * Calculate action priority based on check properties
 */
function calculatePriority(check: CheckConfig): ActionPriority {
  // Required checks at L1 are critical
  if (check.required && check.level === 'L1') {
    return 'critical';
  }

  // Required checks are high priority
  if (check.required) {
    return 'high';
  }

  // L1-L2 non-required are medium
  if (check.level === 'L1' || check.level === 'L2') {
    return 'medium';
  }

  // Everything else is low
  return 'low';
}

/**
 * Get template file name for a check if applicable
 */
function getTemplateForCheck(check: CheckConfig): string | undefined {
  // Map check IDs to template files
  const templateMap: Record<string, string> = {
    'docs.agents_md': 'AGENTS.md',
    'docs.contributing': 'CONTRIBUTING.md',
    'env.dotenv_example': '.env.example',
    'security.gitignore': '.gitignore',
    'build.github_workflow': '.github/workflows/ci.yml',
    // Templates for Factory parity
    'env.devcontainer': '.devcontainer/devcontainer.json',
    'security.codeowners': '.github/CODEOWNERS',
    'task_discovery.issue_templates': '.github/ISSUE_TEMPLATE/bug_report.md',
    'task_discovery.pr_template': '.github/PULL_REQUEST_TEMPLATE.md',
    'env.docker_compose': 'docker-compose.yml',
    // Agent Configuration templates (v0.0.2)
    'agent_config.agents_md': 'AGENTS.md',
    'agent_config.claude_settings': '.claude/settings.json',
    'agent_config.cursorrules': '.cursorrules',
    'agent_config.copilot_config': '.github/copilot-instructions.md',
  };

  return templateMap[check.id];
}

/**
 * Scan monorepo apps and aggregate results
 */
async function scanMonorepoApps(
  appPaths: string[],
  options: ScanOptions,
  checks: CheckConfig[]
): Promise<MonorepoApp[]> {
  const apps: MonorepoApp[] = [];

  for (const appPath of appPaths) {
    const fullPath = path.join(options.path, appPath);

    try {
      const context = await buildScanContext(fullPath);

      // Run checks scoped to app
      const results = await executeChecks(checks, context);
      const levelSummaries = calculateLevelSummaries(results);
      const achievedLevel = determineAchievedLevel(levelSummaries);
      const score = calculateOverallScore(results);
      const passed = results.filter((r) => r.passed).length;

      apps.push({
        name: appPath.split('/').pop() || appPath,
        path: appPath,
        level: achievedLevel,
        score,
        checks_passed: passed,
        checks_total: results.length,
      });
    } catch (error) {
      // Record failed apps with error details
      apps.push({
        name: appPath.split('/').pop() || appPath,
        path: appPath,
        level: null,
        score: 0,
        checks_passed: 0,
        checks_total: 0,
        error: error instanceof Error ? error.message : 'Unknown error during scan',
      });
    }
  }

  return apps;
}

/**
 * Filter checks based on project type applicability
 *
 * This is the core of the "production control layer" concept:
 * - CLI projects don't need K8s checks
 * - Libraries don't need feature flags
 * - Web services need deployment checks
 */
function filterChecksByProjectType(checks: CheckConfig[], context: ScanContext): CheckConfig[] {
  const projectType = context.project_type.type;

  return checks.filter((check) => {
    // If no applicableTo specified, check applies to all
    if (!check.applicableTo || check.applicableTo.length === 0) {
      return true;
    }

    return isApplicableToProjectType(check.applicableTo, projectType);
  });
}
