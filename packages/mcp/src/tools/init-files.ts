/**
 * init_files tool
 *
 * Generates missing agent-ready configuration files using templates.
 */

import { z } from 'zod';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { getTemplates, getTemplateForCheck } from 'agent-ready';

export const initFilesSchema = z.object({
  path: z.string().describe('Path to the repository'),
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
  name: string;
  template_path: string;
  would_create: string;
}

export async function initFiles(input: InitFilesInput): Promise<string> {
  const { path: repoPath, check_id, dry_run } = input;

  try {
    // Get all available templates
    let templates = await getTemplates();

    // Filter by check_id if specified
    if (check_id) {
      const template = await getTemplateForCheck(check_id);
      templates = template ? [template] : [];
    }

    // Check which files are missing
    const templatesInfo: TemplateInfo[] = [];

    for (const template of templates) {
      const targetPath = path.join(repoPath, template.targetPath);
      let exists = false;
      try {
        await fs.access(targetPath);
        exists = true;
      } catch {
        // File doesn't exist
      }

      if (!exists) {
        templatesInfo.push({
          check_id: template.checkId,
          name: template.name,
          template_path: template.targetPath,
          would_create: targetPath,
        });
      }
    }

    // If not dry_run, create the files
    const createdFiles: string[] = [];

    if (!dry_run) {
      for (const info of templatesInfo) {
        const template = await getTemplateForCheck(info.check_id);
        if (!template) continue;

        const targetPath = path.join(repoPath, template.targetPath);

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
      templates_available: templatesInfo.length,
      templates: templatesInfo,
      ...(dry_run
        ? {}
        : {
            files_created: createdFiles.length,
            created: createdFiles,
          }),
    };

    return JSON.stringify(response, null, 2);
  } catch (error) {
    throw new Error(
      `Failed to init files: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
