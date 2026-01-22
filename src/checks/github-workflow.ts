/**
 * github_workflow_event check implementation
 *
 * Checks if GitHub workflows are configured to trigger on specific events
 */

import * as path from 'node:path';
import * as yaml from 'js-yaml';
import type {
  GitHubWorkflowEventCheck,
  CheckResult,
  ScanContext,
} from '../types.js';
import { findFilesCached, readFileCached, relativePath } from '../utils/fs.js';

interface WorkflowConfig {
  name?: string;
  on?: WorkflowTriggers;
}

type WorkflowTriggers =
  | string
  | string[]
  | {
      [event: string]: {
        branches?: string[];
        tags?: string[];
        paths?: string[];
      } | null;
    };

/**
 * Type guard to validate parsed YAML is a workflow config
 */
function isWorkflowConfig(value: unknown): value is WorkflowConfig {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const obj = value as Record<string, unknown>;
  // 'on' must be string, array, or object if present
  if (obj.on !== undefined) {
    if (
      typeof obj.on !== 'string' &&
      !Array.isArray(obj.on) &&
      (typeof obj.on !== 'object' || obj.on === null)
    ) {
      return false;
    }
  }
  return true;
}

export async function executeGitHubWorkflowEvent(
  check: GitHubWorkflowEventCheck,
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
  const errors: string[] = [];

  for (const workflowPath of workflowFiles) {
    const content = await readFileCached(workflowPath, context.file_cache);
    if (!content) continue;

    try {
      const parsed = yaml.load(content);
      if (!isWorkflowConfig(parsed) || !parsed.on) continue;

      const hasEvent = checkForEvent(parsed.on, check.event, check.branches);
      if (hasEvent) {
        matchingWorkflows.push(relativePath(workflowPath, context.root_path));
      }
    } catch (e) {
      errors.push(`Failed to parse ${path.basename(workflowPath)}`);
    }
  }

  if (matchingWorkflows.length > 0) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: true,
      required: check.required,
      message: `Found ${matchingWorkflows.length} workflow(s) triggered on '${check.event}'`,
      matched_files: matchingWorkflows,
    };
  }

  return {
    check_id: check.id,
    check_name: check.name,
    pillar: check.pillar,
    level: check.level,
    passed: false,
    required: check.required,
    message: `No workflows found that trigger on '${check.event}'`,
    suggestions: [
      `Add a workflow that triggers on '${check.event}'`,
      'Example: on: { push: { branches: [main] } }',
    ],
    details: {
      workflows_checked: workflowFiles.length,
      parse_errors: errors.length > 0 ? errors : undefined,
    },
  };
}

function checkForEvent(
  triggers: WorkflowTriggers,
  event: string,
  requiredBranches?: string[]
): boolean {
  // String trigger: on: push
  if (typeof triggers === 'string') {
    return triggers === event && !requiredBranches;
  }

  // Array trigger: on: [push, pull_request]
  if (Array.isArray(triggers)) {
    return triggers.includes(event) && !requiredBranches;
  }

  // Object trigger: on: { push: { branches: [main] } }
  if (typeof triggers === 'object' && triggers !== null) {
    const eventConfig = triggers[event];

    // Event not present
    if (eventConfig === undefined) {
      return false;
    }

    // Event present but null (e.g., on: { push: })
    if (eventConfig === null) {
      return !requiredBranches;
    }

    // No branch requirements
    if (!requiredBranches) {
      return true;
    }

    // Check branches
    const configBranches = eventConfig.branches || [];
    return requiredBranches.every((branch) => configBranches.includes(branch));
  }

  return false;
}
