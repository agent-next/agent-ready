/**
 * check_repo_readiness - area-based readiness checker
 *
 * Checks 9 areas of agent readiness and returns structured results.
 * No scoring, no levels — just present/missing per area.
 */

import * as path from 'node:path';
import type { Language, PackageJson } from './types.js';
import { fileExists, readFile, findFiles, directoryExists } from './utils/fs.js';
import { buildScanContext } from './engine/context.js';

export type AreaName =
  | 'agent_guidance'
  | 'code_quality'
  | 'testing'
  | 'ci_cd'
  | 'hooks'
  | 'branch_rulesets'
  | 'templates'
  | 'devcontainer'
  | 'security';

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
    areas: Record<AreaName, AreaStatus>;
  };
}

/**
 * Check a repository's readiness for AI agents across 9 areas.
 */
export async function checkRepoReadiness(repoPath: string): Promise<ReadinessResult> {
  const ctx = await buildScanContext(repoPath);

  const [agent_guidance, code_quality, testing, ci_cd, hooks, templates, devcontainer, security] =
    await Promise.all([
      checkAgentGuidance(repoPath),
      checkCodeQuality(repoPath, ctx.language),
      checkTesting(repoPath, ctx.package_json),
      checkCiCd(repoPath),
      checkHooks(repoPath),
      checkTemplates(repoPath),
      checkDevcontainer(repoPath),
      checkSecurity(repoPath),
    ]);

  const areas: Record<AreaName, AreaStatus> = {
    agent_guidance,
    code_quality,
    testing,
    ci_cd,
    hooks,
    branch_rulesets: checkBranchRulesets(),
    templates,
    devcontainer,
    security,
  };

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

  if (language === 'typescript') {
    checks.push({ label: 'tsconfig.json', paths: ['tsconfig.json'] });
  }
  checks.push({ label: '.editorconfig', paths: ['.editorconfig'] });

  const { present, missing } = await checkFiles(repoPath, checks);

  // Python linter: check for ruff in pyproject.toml (no file-existence hack needed)
  if (language === 'python') {
    const pyprojectContent = await readFile(path.join(repoPath, 'pyproject.toml'));
    if (pyprojectContent?.includes('ruff')) {
      present.push('linter (ruff)');
    } else {
      missing.push('linter (ruff)');
    }
  }

  return { status: computeStatus(present, missing), present, missing };
}

async function checkTesting(repoPath: string, packageJson?: PackageJson): Promise<AreaStatus> {
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

  // Check for test config files
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

  let hasTestConfig = false;
  for (const f of testConfigFiles) {
    if (await fileExists(path.join(repoPath, f))) {
      hasTestConfig = true;
      break;
    }
  }

  // Read pyproject.toml once for both test config and coverage checks
  const pyprojectContent = await readFile(path.join(repoPath, 'pyproject.toml'));

  if (!hasTestConfig && pyprojectContent?.includes('[tool.pytest')) {
    hasTestConfig = true;
  }

  if (hasTestConfig) {
    present.push('test config');
  } else {
    missing.push('test config');
  }

  // Check for coverage config using ctx.package_json (already parsed)
  const coverageIndicators = ['c8', 'istanbul', 'nyc', 'coverage', 'pytest-cov'];
  let hasCoverage = false;

  if (packageJson) {
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    for (const indicator of coverageIndicators) {
      if (allDeps[indicator]) {
        hasCoverage = true;
        break;
      }
    }
  }

  if (!hasCoverage && pyprojectContent?.includes('pytest-cov')) {
    hasCoverage = true;
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

  // Single glob with brace expansion for both .yml and .yaml
  const allWorkflows = await findFiles('.github/workflows/*.{yml,yaml}', repoPath);

  if (allWorkflows.length > 0) {
    present.push('CI workflow');
  } else {
    missing.push('CI workflow');
  }

  // claude.yml is already found by the glob above — check in-memory
  const hasClaude = allWorkflows.some((f) => f.endsWith('/claude.yml'));
  if (hasClaude) {
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

  // Single glob with brace expansion for all issue template formats
  const issueTemplates = await findFiles('.github/ISSUE_TEMPLATE/*.{yml,yaml,md}', repoPath);
  if (issueTemplates.length > 0) {
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

  // Check for CODEOWNERS (two common locations)
  const hasCodeowners =
    (await fileExists(path.join(repoPath, '.github/CODEOWNERS'))) ||
    (await fileExists(path.join(repoPath, 'CODEOWNERS')));
  if (hasCodeowners) {
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
