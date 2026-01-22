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
    checkId: 'ci.github_workflow',
    name: 'CI Workflow',
    description: 'GitHub Actions CI workflow',
    targetPath: '.github/workflows/ci.yml',
  },
];

// Map source file names (some differ from target)
const SOURCE_FILE_MAP: Record<string, string> = {
  '.gitignore': '.gitignore.template',
  '.github/workflows/ci.yml': 'github-workflow.yml',
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
