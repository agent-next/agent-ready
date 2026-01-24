/**
 * Tests for check implementations
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { executeCheck } from '../src/checks/index.js';
import type {
  ScanContext,
  FileExistsCheck,
  PathGlobCheck,
  AnyOfCheck,
  GitHubWorkflowEventCheck,
  GitHubActionPresentCheck,
  BuildCommandDetectCheck,
  DependencyDetectCheck,
} from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const MINIMAL_REPO = path.join(FIXTURES_DIR, 'minimal-repo');
const STANDARD_REPO = path.join(FIXTURES_DIR, 'standard-repo');

function createContext(rootPath: string): ScanContext {
  return {
    root_path: rootPath,
    repo_name: path.basename(rootPath),
    commit_sha: 'test123',
    file_cache: new Map(),
    glob_cache: new Map(),
    is_monorepo: false,
    monorepo_apps: [],
  };
}

describe('file_exists check', () => {
  it('should pass when file exists', async () => {
    const context = createContext(MINIMAL_REPO);
    const check: FileExistsCheck = {
      id: 'test.readme',
      name: 'README exists',
      description: 'Test',
      type: 'file_exists',
      pillar: 'docs',
      level: 'L1',
      required: true,
      path: 'README.md',
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, true);
    assert.strictEqual(result.check_id, 'test.readme');
  });

  it('should fail when file does not exist', async () => {
    const context = createContext(MINIMAL_REPO);
    const check: FileExistsCheck = {
      id: 'test.nonexistent',
      name: 'Nonexistent file',
      description: 'Test',
      type: 'file_exists',
      pillar: 'docs',
      level: 'L1',
      required: false,
      path: 'NONEXISTENT.md',
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, false);
  });

  it('should check content regex when provided', async () => {
    const context = createContext(STANDARD_REPO);
    const check: FileExistsCheck = {
      id: 'test.readme_content',
      name: 'README has installation',
      description: 'Test',
      type: 'file_exists',
      pillar: 'docs',
      level: 'L2',
      required: false,
      path: 'README.md',
      content_regex: 'installation',
      case_sensitive: false,
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, true);
  });
});

describe('path_glob check', () => {
  it('should find matching files', async () => {
    const context = createContext(STANDARD_REPO);
    const check: PathGlobCheck = {
      id: 'test.test_files',
      name: 'Test files exist',
      description: 'Test',
      type: 'path_glob',
      pillar: 'test',
      level: 'L1',
      required: false,
      pattern: '**/*.test.ts',
      min_matches: 1,
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, true);
    assert.ok(result.matched_files && result.matched_files.length >= 1);
  });

  it('should fail when not enough matches', async () => {
    const context = createContext(MINIMAL_REPO);
    const check: PathGlobCheck = {
      id: 'test.test_files',
      name: 'Test files exist',
      description: 'Test',
      type: 'path_glob',
      pillar: 'test',
      level: 'L1',
      required: false,
      pattern: '**/*.test.ts',
      min_matches: 1,
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, false);
  });
});

describe('any_of check', () => {
  it('should pass when at least one nested check passes', async () => {
    const context = createContext(STANDARD_REPO);
    const check: AnyOfCheck = {
      id: 'test.any_config',
      name: 'Any config exists',
      description: 'Test',
      type: 'any_of',
      pillar: 'style',
      level: 'L1',
      required: false,
      checks: [
        {
          id: 'test.eslint',
          name: 'ESLint',
          description: 'Test',
          type: 'path_glob',
          pillar: 'style',
          level: 'L1',
          required: false,
          pattern: '.eslint*',
        },
        {
          id: 'test.prettier',
          name: 'Prettier',
          description: 'Test',
          type: 'path_glob',
          pillar: 'style',
          level: 'L1',
          required: false,
          pattern: '.prettier*',
        },
      ],
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, true);
  });

  it('should fail when no nested checks pass', async () => {
    const context = createContext(MINIMAL_REPO);
    const check: AnyOfCheck = {
      id: 'test.any_config',
      name: 'Any config exists',
      description: 'Test',
      type: 'any_of',
      pillar: 'style',
      level: 'L1',
      required: false,
      checks: [
        {
          id: 'test.eslint',
          name: 'ESLint',
          description: 'Test',
          type: 'path_glob',
          pillar: 'style',
          level: 'L1',
          required: false,
          pattern: '.eslint*',
        },
        {
          id: 'test.prettier',
          name: 'Prettier',
          description: 'Test',
          type: 'path_glob',
          pillar: 'style',
          level: 'L1',
          required: false,
          pattern: '.prettier*',
        },
      ],
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, false);
  });
});

describe('github_workflow_event check', () => {
  it('should detect push event in workflow', async () => {
    const context = createContext(STANDARD_REPO);
    const check: GitHubWorkflowEventCheck = {
      id: 'test.ci_push',
      name: 'CI on push',
      description: 'Test',
      type: 'github_workflow_event',
      pillar: 'build',
      level: 'L2',
      required: false,
      event: 'push',
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, true);
    assert.ok(result.matched_files && result.matched_files.length >= 1);
  });

  it('should detect pull_request event in workflow', async () => {
    const context = createContext(STANDARD_REPO);
    const check: GitHubWorkflowEventCheck = {
      id: 'test.ci_pr',
      name: 'CI on pull_request',
      description: 'Test',
      type: 'github_workflow_event',
      pillar: 'build',
      level: 'L2',
      required: false,
      event: 'pull_request',
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, true);
  });

  it('should fail when event not present', async () => {
    const context = createContext(STANDARD_REPO);
    const check: GitHubWorkflowEventCheck = {
      id: 'test.ci_schedule',
      name: 'CI on schedule',
      description: 'Test',
      type: 'github_workflow_event',
      pillar: 'build',
      level: 'L2',
      required: false,
      event: 'schedule',
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, false);
  });
});

describe('github_action_present check', () => {
  it('should detect actions/checkout in workflow', async () => {
    const context = createContext(STANDARD_REPO);
    const check: GitHubActionPresentCheck = {
      id: 'test.checkout',
      name: 'Uses checkout action',
      description: 'Test',
      type: 'github_action_present',
      pillar: 'build',
      level: 'L2',
      required: false,
      action: 'actions/checkout@v4',
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, true);
    assert.ok(result.matched_files && result.matched_files.length >= 1);
  });

  it('should detect actions/setup-node in workflow', async () => {
    const context = createContext(STANDARD_REPO);
    const check: GitHubActionPresentCheck = {
      id: 'test.setup_node',
      name: 'Uses setup-node action',
      description: 'Test',
      type: 'github_action_present',
      pillar: 'build',
      level: 'L2',
      required: false,
      action: 'actions/setup-node@v4',
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, true);
  });

  it('should fail when action not present', async () => {
    const context = createContext(STANDARD_REPO);
    const check: GitHubActionPresentCheck = {
      id: 'test.codecov',
      name: 'Uses codecov action',
      description: 'Test',
      type: 'github_action_present',
      pillar: 'build',
      level: 'L2',
      required: false,
      action: 'codecov/codecov-action@v4',
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, false);
  });
});

describe('build_command_detect check', () => {
  it('should detect build command in package.json', async () => {
    const context = createContext(STANDARD_REPO);
    const check: BuildCommandDetectCheck = {
      id: 'test.build_cmd',
      name: 'Build command exists',
      description: 'Test',
      type: 'build_command_detect',
      pillar: 'build',
      level: 'L1',
      required: false,
      commands: ['build'],
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, true);
    assert.ok(result.matched_files?.includes('package.json'));
  });

  it('should detect test command in package.json', async () => {
    const context = createContext(STANDARD_REPO);
    const check: BuildCommandDetectCheck = {
      id: 'test.test_cmd',
      name: 'Test command exists',
      description: 'Test',
      type: 'build_command_detect',
      pillar: 'build',
      level: 'L1',
      required: false,
      commands: ['test'],
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, true);
  });

  it('should fail when command not present', async () => {
    const context = createContext(MINIMAL_REPO);
    const check: BuildCommandDetectCheck = {
      id: 'test.deploy_cmd',
      name: 'Deploy command exists',
      description: 'Test',
      type: 'build_command_detect',
      pillar: 'build',
      level: 'L1',
      required: false,
      commands: ['deploy'],
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, false);
  });
});

describe('dependency_detect check', () => {
  it('should detect typescript in package.json', async () => {
    const context = createContext(STANDARD_REPO);
    context.package_json = {
      devDependencies: { typescript: '^5.0.0', vitest: '^1.0.0' },
    };
    const check: DependencyDetectCheck = {
      id: 'test.typescript',
      name: 'TypeScript installed',
      description: 'Test',
      type: 'dependency_detect',
      pillar: 'style',
      level: 'L2',
      required: false,
      packages: ['typescript'],
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, true);
    assert.ok(result.matched_files?.includes('package.json'));
  });

  it('should fail when dependency not present', async () => {
    const context = createContext(STANDARD_REPO);
    context.package_json = {
      devDependencies: { typescript: '^5.0.0' },
    };
    const check: DependencyDetectCheck = {
      id: 'test.opentelemetry',
      name: 'OpenTelemetry installed',
      description: 'Test',
      type: 'dependency_detect',
      pillar: 'observability',
      level: 'L4',
      required: false,
      packages: ['@opentelemetry/sdk-trace-node'],
    };

    const result = await executeCheck(check, context);
    assert.strictEqual(result.passed, false);
  });
});
