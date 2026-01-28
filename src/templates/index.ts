/**
 * Template loader for init command
 *
 * Provides templates that can be generated to help achieve higher readiness levels
 */

import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from '../utils/fs.js';

// Get the directory of this module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Templates directory (relative to compiled output)
const TEMPLATES_DIR = path.resolve(__dirname, '../../templates');

export interface Template {
  checkId: string;
  name: string;
  description: string;
  targetPath: string;
  content: string;
}

// Template definitions
const TEMPLATE_DEFS: Array<Omit<Template, 'content'>> = [
  {
    checkId: 'docs.agents_md',
    name: 'AGENTS.md',
    description: 'AI agent instructions file',
    targetPath: 'AGENTS.md',
  },
  {
    checkId: 'docs.contributing',
    name: 'CONTRIBUTING.md',
    description: 'Contributing guidelines',
    targetPath: 'CONTRIBUTING.md',
  },
  {
    checkId: 'env.dotenv_example',
    name: '.env.example',
    description: 'Environment variables template',
    targetPath: '.env.example',
  },
  {
    checkId: 'security.gitignore',
    name: '.gitignore',
    description: 'Git ignore file',
    targetPath: '.gitignore',
  },
  {
    checkId: 'build.github_workflow',
    name: 'CI Workflow',
    description: 'GitHub Actions CI workflow',
    targetPath: '.github/workflows/ci.yml',
  },
  // New templates for Factory parity
  {
    checkId: 'env.devcontainer',
    name: 'Devcontainer',
    description: 'VS Code development container configuration',
    targetPath: '.devcontainer/devcontainer.json',
  },
  {
    checkId: 'security.codeowners',
    name: 'CODEOWNERS',
    description: 'Code ownership definitions for review routing',
    targetPath: '.github/CODEOWNERS',
  },
  {
    checkId: 'task_discovery.issue_templates',
    name: 'Issue Templates',
    description: 'GitHub issue templates for bug reports and features',
    targetPath: '.github/ISSUE_TEMPLATE/bug_report.md',
  },
  {
    checkId: 'task_discovery.pr_template',
    name: 'PR Template',
    description: 'Pull request template for consistent contributions',
    targetPath: '.github/PULL_REQUEST_TEMPLATE.md',
  },
  {
    checkId: 'env.docker_compose',
    name: 'Docker Compose',
    description: 'Local development services configuration',
    targetPath: 'docker-compose.yml',
  },
];

// Map source file names (some differ from target)
const SOURCE_FILE_MAP: Record<string, string> = {
  '.gitignore': '.gitignore.template',
  '.github/workflows/ci.yml': 'github-workflow.yml',
  '.github/CODEOWNERS': 'CODEOWNERS.template',
  '.github/ISSUE_TEMPLATE/bug_report.md': 'ISSUE_TEMPLATE/bug_report.md',
  '.github/PULL_REQUEST_TEMPLATE.md': 'PULL_REQUEST_TEMPLATE.md',
};

/**
 * Load all templates with their content
 */
export async function getTemplates(): Promise<Template[]> {
  const templates: Template[] = [];

  for (const def of TEMPLATE_DEFS) {
    const sourceFile = SOURCE_FILE_MAP[def.targetPath] || path.basename(def.targetPath);
    const sourcePath = path.join(TEMPLATES_DIR, sourceFile);
    const content = await readFile(sourcePath);

    if (content) {
      templates.push({
        ...def,
        content,
      });
    }
  }

  return templates;
}

/**
 * Get a single template by check ID
 */
export async function getTemplateForCheck(checkId: string): Promise<Template | null> {
  const templates = await getTemplates();
  return templates.find((t) => t.checkId === checkId) || null;
}

/**
 * List available templates
 */
export function listTemplates(): Array<Omit<Template, 'content'>> {
  return TEMPLATE_DEFS;
}
