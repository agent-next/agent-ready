/**
 * Check registry and executor
 *
 * Dispatches check execution to the appropriate handler based on check type
 */

import type { CheckConfig, CheckResult, ScanContext } from '../types.js';
import { executeFileExists } from './file-exists.js';
import { executePathGlob } from './path-glob.js';
import { executeAnyOf } from './any-of.js';
import { executeGitHubWorkflowEvent } from './github-workflow.js';
import { executeGitHubActionPresent } from './github-action.js';
import { executeBuildCommandDetect } from './build-command.js';
import { executeLogFrameworkDetect } from './log-framework.js';
import { executeDependencyDetect } from './dependency-detect.js';
import { executeGitFreshness } from './git-freshness.js';
import { executeCommandExists } from './command-exists.js';

/**
 * Execute a check and return the result
 */
export async function executeCheck(check: CheckConfig, context: ScanContext): Promise<CheckResult> {
  switch (check.type) {
    case 'file_exists':
      return executeFileExists(check, context);

    case 'path_glob':
      return executePathGlob(check, context);

    case 'any_of':
      return executeAnyOf(check, context);

    case 'github_workflow_event':
      return executeGitHubWorkflowEvent(check, context);

    case 'github_action_present':
      return executeGitHubActionPresent(check, context);

    case 'build_command_detect':
      return executeBuildCommandDetect(check, context);

    case 'log_framework_detect':
      return executeLogFrameworkDetect(check, context);

    case 'dependency_detect':
      return executeDependencyDetect(check, context);

    case 'git_freshness':
      return executeGitFreshness(check as any, context);

    case 'command_exists':
      return executeCommandExists(check as any, context);

    default: {
      // This should never happen due to TypeScript and YAML validation,
      // but handle gracefully by preserving check properties
      const unknownCheck = check as CheckConfig & { type: string };
      return {
        check_id: unknownCheck.id,
        check_name: unknownCheck.name,
        pillar: unknownCheck.pillar,
        level: unknownCheck.level,
        passed: false,
        required: unknownCheck.required,
        message: `Unknown check type: ${unknownCheck.type}`,
      };
    }
  }
}

/**
 * Execute multiple checks in parallel
 */
export async function executeChecks(
  checks: CheckConfig[],
  context: ScanContext
): Promise<CheckResult[]> {
  const results = await Promise.all(checks.map((check) => executeCheck(check, context)));
  return results;
}

/**
 * Get all supported check types
 */
export function getSupportedCheckTypes(): string[] {
  return [
    'file_exists',
    'path_glob',
    'any_of',
    'github_workflow_event',
    'github_action_present',
    'build_command_detect',
    'log_framework_detect',
    'dependency_detect',
    'git_freshness',
    'command_exists',
  ];
}
