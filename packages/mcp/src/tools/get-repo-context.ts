/**
 * get_repo_context tool - Returns project structure and tech stack
 *
 * This tool provides context for Claude to perform its own analysis.
 * Instead of running checks and returning results, it returns information
 * that Claude can use to analyze the repository itself.
 */

import { z } from 'zod';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';

export const getRepoContextSchema = z.object({
  path: z.string().describe('Path to the repository'),
});

export type GetRepoContextInput = z.infer<typeof getRepoContextSchema>;

interface RepoContext {
  root_path: string;
  tech_stack: {
    language: string;
    framework?: string;
    package_manager?: string;
  };
  key_files: {
    readme?: string;
    agents_md?: string;
    package_manifest?: string;
    lock_file?: string;
  };
  agent_config_files: {
    agents_md?: string;
    claude_settings?: string;
    cursorrules?: string;
    mcp_json?: string;
    copilot_instructions?: string;
  };
  structure: {
    has_src: boolean;
    has_tests: boolean;
    has_docs: boolean;
    has_ci: boolean;
    is_monorepo: boolean;
  };
  file_count: number;
}

export async function getRepoContext(input: GetRepoContextInput): Promise<string> {
  const { path: repoPath } = input;
  const absPath = path.resolve(repoPath);

  // Detect tech stack
  const techStack = detectTechStack(absPath);

  // Find key files
  const keyFiles = findKeyFiles(absPath);

  // Find agent config files
  const agentConfigFiles = findAgentConfigFiles(absPath);

  // Analyze structure
  const structure = analyzeStructure(absPath);

  // Count files (excluding node_modules, .git, etc.)
  const fileCount = await countFiles(absPath);

  const context: RepoContext = {
    root_path: absPath,
    tech_stack: techStack,
    key_files: keyFiles,
    agent_config_files: agentConfigFiles,
    structure,
    file_count: fileCount,
  };

  return JSON.stringify(context, null, 2);
}

function detectTechStack(repoPath: string): RepoContext['tech_stack'] {
  // Check for Node.js
  if (fs.existsSync(path.join(repoPath, 'package.json'))) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(repoPath, 'package.json'), 'utf-8'));
      let framework: string | undefined;

      // Detect framework from dependencies
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps.react) framework = 'react';
      else if (deps.vue) framework = 'vue';
      else if (deps.next) framework = 'next.js';
      else if (deps.express) framework = 'express';
      else if (deps.fastify) framework = 'fastify';
      else if (deps.hono) framework = 'hono';

      // Detect package manager
      let packageManager: string | undefined;
      if (fs.existsSync(path.join(repoPath, 'pnpm-lock.yaml'))) packageManager = 'pnpm';
      else if (fs.existsSync(path.join(repoPath, 'yarn.lock'))) packageManager = 'yarn';
      else if (fs.existsSync(path.join(repoPath, 'package-lock.json'))) packageManager = 'npm';

      return {
        language: deps.typescript || deps['@types/node'] ? 'typescript' : 'javascript',
        framework,
        package_manager: packageManager,
      };
    } catch {
      // Malformed package.json, fall through to other language checks
    }
  }

  // Check for Python
  if (
    fs.existsSync(path.join(repoPath, 'pyproject.toml')) ||
    fs.existsSync(path.join(repoPath, 'setup.py')) ||
    fs.existsSync(path.join(repoPath, 'requirements.txt'))
  ) {
    return { language: 'python' };
  }

  // Check for Go
  if (fs.existsSync(path.join(repoPath, 'go.mod'))) {
    return { language: 'go' };
  }

  // Check for Rust
  if (fs.existsSync(path.join(repoPath, 'Cargo.toml'))) {
    return { language: 'rust' };
  }

  return { language: 'unknown' };
}

function findKeyFiles(repoPath: string): RepoContext['key_files'] {
  const keyFiles: RepoContext['key_files'] = {};

  // README
  const readmeVariants = ['README.md', 'Readme.md', 'readme.md', 'README.rst'];
  for (const variant of readmeVariants) {
    if (fs.existsSync(path.join(repoPath, variant))) {
      keyFiles.readme = variant;
      break;
    }
  }

  // AGENTS.md
  if (fs.existsSync(path.join(repoPath, 'AGENTS.md'))) {
    keyFiles.agents_md = 'AGENTS.md';
  } else if (fs.existsSync(path.join(repoPath, 'CLAUDE.md'))) {
    keyFiles.agents_md = 'CLAUDE.md';
  }

  // Package manifest
  const manifests = [
    'package.json',
    'pyproject.toml',
    'Cargo.toml',
    'go.mod',
    'pom.xml',
    'build.gradle',
  ];
  for (const manifest of manifests) {
    if (fs.existsSync(path.join(repoPath, manifest))) {
      keyFiles.package_manifest = manifest;
      break;
    }
  }

  // Lock file
  const lockFiles = [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'poetry.lock',
    'Cargo.lock',
    'go.sum',
  ];
  for (const lockFile of lockFiles) {
    if (fs.existsSync(path.join(repoPath, lockFile))) {
      keyFiles.lock_file = lockFile;
      break;
    }
  }

  return keyFiles;
}

function findAgentConfigFiles(repoPath: string): RepoContext['agent_config_files'] {
  const agentFiles: RepoContext['agent_config_files'] = {};

  // AGENTS.md or CLAUDE.md
  if (fs.existsSync(path.join(repoPath, 'AGENTS.md'))) {
    agentFiles.agents_md = 'AGENTS.md';
  } else if (fs.existsSync(path.join(repoPath, 'CLAUDE.md'))) {
    agentFiles.agents_md = 'CLAUDE.md';
  }

  // Claude settings
  if (fs.existsSync(path.join(repoPath, '.claude/settings.json'))) {
    agentFiles.claude_settings = '.claude/settings.json';
  } else if (fs.existsSync(path.join(repoPath, '.claude/settings.local.json'))) {
    agentFiles.claude_settings = '.claude/settings.local.json';
  }

  // Cursor rules
  if (fs.existsSync(path.join(repoPath, '.cursorrules'))) {
    agentFiles.cursorrules = '.cursorrules';
  } else if (fs.existsSync(path.join(repoPath, '.cursor/rules'))) {
    agentFiles.cursorrules = '.cursor/rules';
  }

  // MCP config
  if (fs.existsSync(path.join(repoPath, 'mcp.json'))) {
    agentFiles.mcp_json = 'mcp.json';
  } else if (fs.existsSync(path.join(repoPath, '.claude/mcp.json'))) {
    agentFiles.mcp_json = '.claude/mcp.json';
  }

  // Copilot instructions
  if (fs.existsSync(path.join(repoPath, '.github/copilot-instructions.md'))) {
    agentFiles.copilot_instructions = '.github/copilot-instructions.md';
  }

  return agentFiles;
}

function analyzeStructure(repoPath: string): RepoContext['structure'] {
  return {
    has_src: fs.existsSync(path.join(repoPath, 'src')),
    has_tests:
      fs.existsSync(path.join(repoPath, 'test')) ||
      fs.existsSync(path.join(repoPath, 'tests')) ||
      fs.existsSync(path.join(repoPath, '__tests__')),
    has_docs: fs.existsSync(path.join(repoPath, 'docs')),
    has_ci: fs.existsSync(path.join(repoPath, '.github/workflows')),
    is_monorepo:
      fs.existsSync(path.join(repoPath, 'packages')) ||
      fs.existsSync(path.join(repoPath, 'apps')) ||
      fs.existsSync(path.join(repoPath, 'lerna.json')) ||
      (() => {
        try {
          const pkg = JSON.parse(fs.readFileSync(path.join(repoPath, 'package.json'), 'utf-8'));
          return !!pkg.workspaces;
        } catch {
          return false;
        }
      })(),
  };
}

async function countFiles(repoPath: string): Promise<number> {
  try {
    const files = await glob('**/*', {
      cwd: repoPath,
      nodir: true,
      ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
    });
    return files.length;
  } catch {
    return 0;
  }
}
