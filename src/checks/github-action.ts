/**
 * github_action_present check implementation
 *
 * Checks if a specific GitHub Action is used in any workflow
 */

import * as path from 'node:path';
import * as yaml from 'js-yaml';
import type {
  GitHubActionPresentCheck,
  CheckResult,
  ScanContext,
} from '../types.js';
import { findFilesCached, readFileCached, relativePath } from '../utils/fs.js';
import { safeRegex } from '../utils/regex.js';

interface WorkflowConfig {
  jobs?: {
    [jobName: string]: {
      steps?: Array<{
        uses?: string;
        name?: string;
      }>;
    };
  };
}

export async function executeGitHubActionPresent(
  check: GitHubActionPresentCheck,
  context: ScanContext
): Promise<CheckResult> {
  // Find all workflow files
  const workflowPattern = '.github/workflows/*.{yml,yaml}';
  const workflowFiles = await findFilesCached(
    workflowPattern,
    context.root_path,
    context.glob_cache
  );

  if (workflowFiles.length === 0) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: false,
      required: check.required,
      message: 'No GitHub workflow files found',
      suggestions: ['Create .github/workflows directory with workflow files'],
    };
  }

  const matchingWorkflows: string[] = [];
  const foundActions: string[] = [];

  // Build regex for action matching (with safety check)
  const actionPattern = check.action_pattern
    ? safeRegex(check.action_pattern)
    : null;

  // If pattern was provided but is invalid/unsafe, fail the check
  if (check.action_pattern && !actionPattern) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: false,
      required: check.required,
      message: `Invalid or unsafe action pattern: ${check.action_pattern}`,
      details: { pattern: check.action_pattern, error: 'Invalid or potentially unsafe regex pattern' },
    };
  }

  for (const workflowPath of workflowFiles) {
    const content = await readFileCached(workflowPath, context.file_cache);
    if (!content) continue;

    try {
      const workflow = yaml.load(content) as WorkflowConfig;
      if (!workflow?.jobs) continue;

      for (const job of Object.values(workflow.jobs)) {
        if (!job.steps) continue;

        for (const step of job.steps) {
          if (!step.uses) continue;

          const isMatch = actionPattern
            ? actionPattern.test(step.uses)
            : step.uses.startsWith(check.action.replace(/@.*$/, ''));

          if (isMatch) {
            matchingWorkflows.push(relativePath(workflowPath, context.root_path));
            foundActions.push(step.uses);
            break;
          }
        }
      }
    } catch {
      // Skip unparseable workflows
    }
  }

  // Deduplicate workflows
  const uniqueWorkflows = [...new Set(matchingWorkflows)];

  if (uniqueWorkflows.length > 0) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: true,
      required: check.required,
      message: `Found action '${check.action}' in ${uniqueWorkflows.length} workflow(s)`,
      matched_files: uniqueWorkflows,
      details: {
        found_actions: [...new Set(foundActions)],
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
    message: `Action '${check.action}' not found in any workflow`,
    suggestions: [
      `Add '${check.action}' to one of your GitHub workflows`,
      'Example: uses: ' + check.action,
    ],
    details: {
      workflows_checked: workflowFiles.length,
    },
  };
}
