/**
 * Init command implementation - generates missing agent-ready files
 */

import * as path from 'node:path';
import chalk from 'chalk';
import type { InitOptions, Level } from '../types.js';
import { directoryExists, fileExists, writeFile, readFile } from '../utils/fs.js';
import { loadDefaultProfile } from '../profiles/index.js';
import { getTemplates, type Template } from '../templates/index.js';

export async function initCommand(options: InitOptions): Promise<void> {
  // Validate path exists
  if (!(await directoryExists(options.path))) {
    console.error(chalk.red(`Error: Path does not exist: ${options.path}`));
    process.exit(1);
  }

  // Validate level if provided
  if (options.level && !isValidLevel(options.level)) {
    console.error(chalk.red(`Error: Invalid level: ${options.level}`));
    console.error('Valid levels: L1, L2, L3, L4, L5');
    process.exit(1);
  }

  try {
    // Load profile to get check definitions
    const profile = await loadDefaultProfile();

    // Get templates to generate
    const templates = await getTemplates();

    // Filter templates based on options
    let templatesNeeded = templates;

    if (options.check) {
      // Generate only the specific check's template
      templatesNeeded = templates.filter((t) => t.checkId === options.check);
      if (templatesNeeded.length === 0) {
        console.error(chalk.red(`Error: No template found for check: ${options.check}`));
        process.exit(1);
      }
    } else if (options.level) {
      // Generate templates needed for the specified level
      const levelChecks = profile.checks.filter(
        (c) => levelValue(c.level) <= levelValue(options.level!)
      );
      const checkIds = new Set(levelChecks.map((c) => c.id));
      templatesNeeded = templates.filter((t) => checkIds.has(t.checkId));
    }

    // Check which files need to be created
    const toCreate: Array<{ template: Template; targetPath: string }> = [];

    for (const template of templatesNeeded) {
      const targetPath = path.join(options.path, template.targetPath);
      const exists = await fileExists(targetPath);

      if (!exists || options.force) {
        toCreate.push({ template, targetPath });
      }
    }

    if (toCreate.length === 0) {
      console.log(chalk.green('All required files already exist.'));
      return;
    }

    // Dry run mode - just show what would be created
    if (options.dryRun) {
      console.log(chalk.cyan('Would create the following files:'));
      for (const { template, targetPath } of toCreate) {
        const relativePath = path.relative(options.path, targetPath);
        console.log(chalk.dim(`  ${relativePath} (for ${template.checkId})`));
      }
      return;
    }

    // Get project context for template variables
    const context = await getProjectContext(options.path);

    // Create files
    console.log(chalk.cyan('Creating files...'));
    for (const { template, targetPath } of toCreate) {
      const content = substituteVariables(template.content, context);
      await writeFile(targetPath, content);
      const relativePath = path.relative(options.path, targetPath);
      console.log(chalk.green(`  Created: ${relativePath}`));
    }

    console.log(chalk.green(`\nCreated ${toCreate.length} file(s).`));
  } catch (error) {
    console.error(chalk.red('Init failed:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function isValidLevel(level: string): level is Level {
  return ['L1', 'L2', 'L3', 'L4', 'L5'].includes(level);
}

function levelValue(level: Level): number {
  return parseInt(level.substring(1), 10);
}

interface ProjectContext {
  projectName: string;
  repoName: string;
  year: string;
}

async function getProjectContext(rootPath: string): Promise<ProjectContext> {
  // Try to get project name from package.json
  const packageJsonPath = path.join(rootPath, 'package.json');
  const packageJsonContent = await readFile(packageJsonPath);

  let projectName = path.basename(rootPath);

  if (packageJsonContent) {
    try {
      const pkg = JSON.parse(packageJsonContent);
      projectName = pkg.name || projectName;
    } catch {
      // Ignore parse errors
    }
  }

  return {
    projectName,
    repoName: path.basename(rootPath),
    year: new Date().getFullYear().toString(),
  };
}

function substituteVariables(content: string, context: ProjectContext): string {
  return content
    .replace(/\{\{PROJECT_NAME\}\}/g, context.projectName)
    .replace(/\{\{REPO_NAME\}\}/g, context.repoName)
    .replace(/\{\{YEAR\}\}/g, context.year);
}
