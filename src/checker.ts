/**
 * check_repo_readiness - area-based readiness checker
 *
 * Checks 9 areas of agent readiness and returns structured results.
 * No scoring, no levels — just present/missing per area.
 */

import * as path from 'node:path';
import type { Language } from './types.js';
import { fileExists, readFile, findFiles, directoryExists } from './utils/fs.js';
import { buildScanContext } from './engine/context.js';

export interface AreaStatus {
  status: 'complete' | 'partial' | 'missing' | 'unknown';
  present: string[];
  missing: string[];
  note?: string;
}

export interface ReadinessResult {
  ok: true;
  data: {
    project_type: string;
    language: string;
    areas: Record<string, AreaStatus>;
  };
}

/**
 * Check a repository's readiness for AI agents across 9 areas.
 */
export async function checkRepoReadiness(repoPath: string): Promise<ReadinessResult> {
  const ctx = await buildScanContext(repoPath);

  const areas: Record<string, AreaStatus> = {};

  areas.agent_guidance = await checkAgentGuidance(repoPath);
  areas.code_quality = await checkCodeQuality(repoPath, ctx.language);
  areas.testing = await checkTesting(repoPath);
  areas.ci_cd = await checkCiCd(repoPath);
  areas.hooks = await checkHooks(repoPath);
  areas.branch_rulesets = checkBranchRulesets();
  areas.templates = await checkTemplates(repoPath);
  areas.devcontainer = await checkDevcontainer(repoPath);
  areas.security = await checkSecurity(repoPath);

  return {
    ok: true,
    data: {
      project_type: ctx.project_type.type,
      language: ctx.language,
      areas,
    },
  };
}

/**
 * Compute status from present/missing counts.
 */
function computeStatus(present: string[], missing: string[]): AreaStatus['status'] {
  if (present.length > 0 && missing.length === 0) return 'complete';
  if (present.length > 0) return 'partial';
  return 'missing';
}

/**
 * Check multiple file paths, returning present/missing lists.
 */
async function checkFiles(
  repoPath: string,
  checks: { label: string; paths: string[] }[]
): Promise<{ present: string[]; missing: string[] }> {
  const present: string[] = [];
  const missing: string[] = [];

  for (const check of checks) {
    let found = false;
    for (const p of check.paths) {
      if (await fileExists(path.join(repoPath, p))) {
        found = true;
        break;
      }
    }
    if (found) {
      present.push(check.label);
    } else {
      missing.push(check.label);
    }
  }

  return { present, missing };
}

// --- Area checkers ---

async function checkAgentGuidance(repoPath: string): Promise<AreaStatus> {
  const { present, missing } = await checkFiles(repoPath, [
    { label: 'AGENTS.md', paths: ['AGENTS.md'] },
    { label: 'CLAUDE.md', paths: ['CLAUDE.md'] },
    { label: 'copilot-instructions.md', paths: ['.github/copilot-instructions.md'] },
    {
      label: 'copilot-setup-steps.yml',
      paths: ['.github/workflows/copilot-setup-steps.yml'],
    },
  ]);

  return { status: computeStatus(present, missing), present, missing };
}

async function checkCodeQuality(repoPath: string, language: Language): Promise<AreaStatus> {
  const checks: { label: string; paths: string[] }[] = [];

  if (language === 'typescript' || language === 'javascript') {
    checks.push({
      label: 'linter',
      paths: [
        'eslint.config.js',
        'eslint.config.mjs',
        'eslint.config.cjs',
        'eslint.config.ts',
        'biome.json',
        '.eslintrc.json',
        '.eslintrc.js',
        '.eslintrc.yml',
        '.eslintrc.yaml',
        '.eslintrc',
      ],
    });
  }

  if (language === 'python') {
    // Check for ruff in pyproject.toml
    const pyprojectContent = await readFile(path.join(repoPath, 'pyproject.toml'));
    const hasRuff = pyprojectContent ? pyprojectContent.includes('ruff') : false;
    if (hasRuff) {
      // Will be added to present below via a different mechanism
      checks.push({ label: 'linter (ruff)', paths: ['pyproject.toml'] });
    } else {
      checks.push({ label: 'linter (ruff)', paths: ['__nonexistent__'] });
    }
  }

  checks.push({ label: 'tsconfig.json', paths: ['tsconfig.json'] });
  checks.push({ label: '.editorconfig', paths: ['.editorconfig'] });

  const { present, missing } = await checkFiles(repoPath, checks);

  return { status: computeStatus(present, missing), present, missing };
}

async function checkTesting(repoPath: string): Promise<AreaStatus> {
  const present: string[] = [];
  const missing: string[] = [];

  // Check for test directory
  const testDirExists =
    (await directoryExists(path.join(repoPath, 'test'))) ||
    (await directoryExists(path.join(repoPath, 'tests'))) ||
    (await directoryExists(path.join(repoPath, '__tests__')));

  if (testDirExists) {
    present.push('test directory');
  } else {
    missing.push('test directory');
  }

  // Check for test config
  const testConfigFiles = [
    'vitest.config.ts',
    'vitest.config.js',
    'vitest.config.mjs',
    'jest.config.ts',
    'jest.config.js',
    'jest.config.mjs',
    'jest.config.json',
    'pytest.ini',
    'setup.cfg',
    'conftest.py',
  ];

  // Also check pyproject.toml for [tool.pytest] section
  let hasTestConfig = false;
  for (const f of testConfigFiles) {
    if (await fileExists(path.join(repoPath, f))) {
      hasTestConfig = true;
      break;
    }
  }

  // Check pyproject.toml for pytest config
  if (!hasTestConfig) {
    const pyprojectContent = await readFile(path.join(repoPath, 'pyproject.toml'));
    if (pyprojectContent && pyprojectContent.includes('[tool.pytest')) {
      hasTestConfig = true;
    }
  }

  if (hasTestConfig) {
    present.push('test config');
  } else {
    missing.push('test config');
  }

  // Check for coverage config
  const coverageIndicators = ['c8', 'istanbul', 'nyc', 'coverage', 'pytest-cov'];
  let hasCoverage = false;

  // Check package.json for coverage tools
  const pkgContent = await readFile(path.join(repoPath, 'package.json'));
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      for (const indicator of coverageIndicators) {
        if (allDeps[indicator]) {
          hasCoverage = true;
          break;
        }
      }
    } catch {
      // ignore
    }
  }

  // Check pyproject.toml for coverage config
  if (!hasCoverage) {
    const pyprojectContent = await readFile(path.join(repoPath, 'pyproject.toml'));
    if (pyprojectContent && pyprojectContent.includes('pytest-cov')) {
      hasCoverage = true;
    }
  }

  if (hasCoverage) {
    present.push('coverage config');
  } else {
    missing.push('coverage config');
  }

  return { status: computeStatus(present, missing), present, missing };
}

async function checkCiCd(repoPath: string): Promise<AreaStatus> {
  const present: string[] = [];
  const missing: string[] = [];

  // Check for any GitHub workflow
  const workflows = await findFiles('.github/workflows/*.yml', repoPath);
  const workflowsYaml = await findFiles('.github/workflows/*.yaml', repoPath);
  const allWorkflows = [...workflows, ...workflowsYaml];

  if (allWorkflows.length > 0) {
    present.push('CI workflow');
  } else {
    missing.push('CI workflow');
  }

  // Check for claude.yml specifically
  if (await fileExists(path.join(repoPath, '.github/workflows/claude.yml'))) {
    present.push('claude.yml');
  } else {
    missing.push('claude.yml');
  }

  return { status: computeStatus(present, missing), present, missing };
}

async function checkHooks(repoPath: string): Promise<AreaStatus> {
  const { present, missing } = await checkFiles(repoPath, [
    {
      label: 'git hooks',
      paths: ['.husky', 'lefthook.yml', '.pre-commit-config.yaml'],
    },
    {
      label: '.claude/settings.json',
      paths: ['.claude/settings.json'],
    },
  ]);

  return { status: computeStatus(present, missing), present, missing };
}

function checkBranchRulesets(): AreaStatus {
  return {
    status: 'unknown',
    present: [],
    missing: [],
    note: 'Requires gh CLI to check',
  };
}

async function checkTemplates(repoPath: string): Promise<AreaStatus> {
  const present: string[] = [];
  const missing: string[] = [];

  // Check for issue templates
  const issueTemplates = await findFiles('.github/ISSUE_TEMPLATE/*.yml', repoPath);
  const issueTemplatesYaml = await findFiles('.github/ISSUE_TEMPLATE/*.yaml', repoPath);
  const issueTemplatesMd = await findFiles('.github/ISSUE_TEMPLATE/*.md', repoPath);
  if (issueTemplates.length + issueTemplatesYaml.length + issueTemplatesMd.length > 0) {
    present.push('issue templates');
  } else {
    missing.push('issue templates');
  }

  // Check for PR template
  if (await fileExists(path.join(repoPath, '.github/PULL_REQUEST_TEMPLATE.md'))) {
    present.push('PR template');
  } else {
    missing.push('PR template');
  }

  // Check for CODEOWNERS
  if (await fileExists(path.join(repoPath, '.github/CODEOWNERS'))) {
    present.push('CODEOWNERS');
  } else if (await fileExists(path.join(repoPath, 'CODEOWNERS'))) {
    present.push('CODEOWNERS');
  } else {
    missing.push('CODEOWNERS');
  }

  return { status: computeStatus(present, missing), present, missing };
}

async function checkDevcontainer(repoPath: string): Promise<AreaStatus> {
  const { present, missing } = await checkFiles(repoPath, [
    {
      label: 'devcontainer.json',
      paths: ['.devcontainer/devcontainer.json'],
    },
  ]);

  return { status: computeStatus(present, missing), present, missing };
}

async function checkSecurity(repoPath: string): Promise<AreaStatus> {
  const { present, missing } = await checkFiles(repoPath, [
    { label: 'dependabot.yml', paths: ['.github/dependabot.yml'] },
    { label: 'SECURITY.md', paths: ['SECURITY.md'] },
  ]);

  return { status: computeStatus(present, missing), present, missing };
}
