/**
 * init_files tool
 *
 * Generates missing agent-ready configuration files based on scan results.
 */

import { z } from 'zod';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { scan, getTemplateForCheck, type Level } from 'agent-ready';

export const initFilesSchema = z.object({
  path: z.string().describe('Path to the repository'),
  level: z.enum(['L1', 'L2', 'L3', 'L4', 'L5']).optional().describe('Generate files for level'),
  check_id: z.string().optional().describe('Generate file for specific check only'),
  dry_run: z
    .boolean()
    .optional()
    .default(true)
    .describe('Show what would be created without creating'),
});

export type InitFilesInput = z.infer<typeof initFilesSchema>;

interface TemplateInfo {
  check_id: string;
  check_name: string;
  level: string;
  pillar: string;
  template_path: string;
  would_create: string;
}

export async function initFiles(input: InitFilesInput): Promise<string> {
  const { path: repoPath, level, check_id, dry_run } = input;

  try {
    // First scan to find failed checks
    const result = await scan({
      path: repoPath,
      profile: 'factory_compat',
      output: 'json',
      level: level as Level | undefined,
      verbose: false,
    });

    // Find checks that can have templates generated
    let failedChecks = result.failed_checks;

    // Filter by level if specified
    if (level) {
      const levelOrder = ['L1', 'L2', 'L3', 'L4', 'L5'];
      const levelIndex = levelOrder.indexOf(level);
      failedChecks = failedChecks.filter((check) => {
        const checkLevelIndex = levelOrder.indexOf(check.level);
        return checkLevelIndex <= levelIndex;
      });
    }

    // Filter by check_id if specified
    if (check_id) {
      failedChecks = failedChecks.filter((check) => check.check_id === check_id);
    }

    // Get templates for failed checks
    const templatesInfo: TemplateInfo[] = [];

    for (const check of failedChecks) {
      const template = await getTemplateForCheck(check.check_id);
      if (template) {
        const targetPath = path.join(repoPath, template.targetPath);
        templatesInfo.push({
          check_id: check.check_id,
          check_name: check.check_name,
          level: check.level,
          pillar: check.pillar,
          template_path: template.targetPath,
          would_create: targetPath,
        });
      }
    }

    // If not dry_run, create the files
    const createdFiles: string[] = [];
    const skippedFiles: string[] = [];

    if (!dry_run) {
      for (const info of templatesInfo) {
        const template = await getTemplateForCheck(info.check_id);
        if (!template) continue;

        const targetPath = path.join(repoPath, template.targetPath);

        // Check if file exists
        try {
          await fs.access(targetPath);
          skippedFiles.push(targetPath);
          continue;
        } catch {
          // File doesn't exist, create it
        }

        // Ensure directory exists
        const dir = path.dirname(targetPath);
        await fs.mkdir(dir, { recursive: true });

        // Write template content
        await fs.writeFile(targetPath, template.content, 'utf-8');
        createdFiles.push(targetPath);
      }
    }

    const response = {
      dry_run,
      current_level: result.level,
      target_level: level,
      templates_available: templatesInfo.length,
      templates: templatesInfo,
      ...(dry_run
        ? {}
        : {
            files_created: createdFiles.length,
            files_skipped: skippedFiles.length,
            created: createdFiles,
            skipped: skippedFiles,
          }),
    };

    return JSON.stringify(response, null, 2);
  } catch (error) {
    throw new Error(
      `Failed to init files: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
