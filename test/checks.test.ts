/**
 * Tests for check implementations
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { executeCheck } from '../src/checks/index.js';
import type { ScanContext, FileExistsCheck, PathGlobCheck, AnyOfCheck } from '../src/types.js';

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
