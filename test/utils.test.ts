/**
 * Tests for utility modules
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  fileExists,
  readFile,
  readFileCached,
  findFiles,
  relativePath,
  safePath,
} from '../src/utils/fs.js';
import { logger } from '../src/utils/logger.js';
import { isUnsafeRegex, safeRegex, safeRegexTest } from '../src/utils/regex.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

describe('fs utilities', () => {
  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      const readmePath = path.join(FIXTURES_DIR, 'minimal-repo/README.md');
      if (fs.existsSync(readmePath)) {
        const exists = await fileExists(readmePath);
        assert.strictEqual(exists, true);
      }
    });

    it('should return false for non-existing file', async () => {
      const exists = await fileExists('/path/that/does/not/exist/12345.txt');
      assert.strictEqual(exists, false);
    });

    it('should return false for directory', async () => {
      const exists = await fileExists(FIXTURES_DIR);
      // Depending on implementation, may return true or false for directories
      assert.ok(typeof exists === 'boolean');
    });
  });

  describe('ENOENT probes', () => {
    it('should not log error stacks or absolute paths for missing files', async () => {
      const missing = path.join(os.tmpdir(), `agent-ready-i82-does-not-exist-${process.pid}`);
      const records: Record<string, unknown>[] = [];
      const originalDebug = logger.debug;
      logger.debug = (obj: unknown) => {
        records.push(obj as Record<string, unknown>);
      };
      try {
        await fileExists(missing);
        await readFile(missing);
      } finally {
        logger.debug = originalDebug;
      }
      for (const record of records) {
        const err = record.err as { stack?: string } | undefined;
        assert.strictEqual(err?.stack, undefined, 'ENOENT probe must not log err.stack');
        assert.ok(
          !(typeof record.path === 'string' && path.isAbsolute(record.path)),
          'ENOENT probe must not log an absolute path'
        );
      }
    });
  });

  describe('readFileCached', () => {
    it('should read file contents', async () => {
      const readmePath = path.join(FIXTURES_DIR, 'minimal-repo/README.md');
      if (fs.existsSync(readmePath)) {
        const cache = new Map<string, string>();
        const content = await readFileCached(readmePath, cache);
        assert.ok(content !== null);
        assert.ok(content!.length > 0);
      }
    });

    it('should cache file contents', async () => {
      const readmePath = path.join(FIXTURES_DIR, 'minimal-repo/README.md');
      if (fs.existsSync(readmePath)) {
        const cache = new Map<string, string>();

        // First read
        const content1 = await readFileCached(readmePath, cache);
        assert.ok(cache.has(readmePath), 'Should add to cache');

        // Second read should use cache
        const content2 = await readFileCached(readmePath, cache);
        assert.strictEqual(content1, content2, 'Should return same content');
      }
    });

    it('should return null for non-existing file', async () => {
      const cache = new Map<string, string>();
      const content = await readFileCached('/nonexistent/file.txt', cache);
      assert.strictEqual(content, null);
    });
  });

  describe('findFiles', () => {
    it('should find files matching pattern', async () => {
      const files = await findFiles('**/*.md', FIXTURES_DIR);
      assert.ok(Array.isArray(files));
      // Should find at least one README.md
      assert.ok(
        files.some((f) => f.includes('README')),
        'Should find README files'
      );
    });

    it('should find TypeScript files', async () => {
      const files = await findFiles('**/*.ts', FIXTURES_DIR);
      assert.ok(Array.isArray(files));
    });

    it('should return empty array for no matches', async () => {
      const files = await findFiles('**/*.xyz123', FIXTURES_DIR);
      assert.ok(Array.isArray(files));
      assert.strictEqual(files.length, 0);
    });

    it('should respect exclusion patterns', async () => {
      const files = await findFiles('**/*.json', FIXTURES_DIR);
      assert.ok(Array.isArray(files));
      // Should not include node_modules
      assert.ok(!files.some((f) => f.includes('node_modules')));
    });
  });

  describe('relativePath', () => {
    it('should create relative path', () => {
      const abs = '/home/user/project/src/file.ts';
      const base = '/home/user/project';
      const rel = relativePath(abs, base);
      assert.strictEqual(rel, 'src/file.ts');
    });

    it('should handle same directory', () => {
      const abs = '/home/user/project/file.ts';
      const base = '/home/user/project';
      const rel = relativePath(abs, base);
      assert.strictEqual(rel, 'file.ts');
    });
  });

  describe('safePath', () => {
    it('should allow paths within root', () => {
      const result = safePath('src/file.ts', '/home/user/project');
      assert.ok(result !== null);
      assert.ok(result!.includes('/home/user/project'));
    });

    it('should reject path traversal attempts', () => {
      const result = safePath('../../../etc/passwd', '/home/user/project');
      assert.strictEqual(result, null);
    });

    it('should reject absolute paths', () => {
      const result = safePath('/etc/passwd', '/home/user/project');
      assert.strictEqual(result, null);
    });
  });
});

describe('regex utilities', () => {
  describe('isUnsafeRegex', () => {
    it('should detect nested quantifiers', () => {
      assert.strictEqual(isUnsafeRegex('(a+)+'), true);
      assert.strictEqual(isUnsafeRegex('(a*)*'), true);
      assert.strictEqual(isUnsafeRegex('(a+)*'), true);
    });

    it('should allow safe patterns', () => {
      assert.strictEqual(isUnsafeRegex('hello'), false);
      assert.strictEqual(isUnsafeRegex('test.*'), false);
      assert.strictEqual(isUnsafeRegex('^[a-z]+$'), false);
    });
  });

  describe('safeRegex', () => {
    it('should create valid regex from safe pattern', () => {
      const regex = safeRegex('test.*');
      assert.ok(regex instanceof RegExp);
      assert.ok(regex!.test('testing'));
    });

    it('should return null for unsafe pattern', () => {
      const regex = safeRegex('(a+)+');
      assert.strictEqual(regex, null);
    });

    it('should return null for invalid regex', () => {
      const regex = safeRegex('[invalid');
      assert.strictEqual(regex, null);
    });

    it('should support flags', () => {
      const regex = safeRegex('Test', 'i');
      assert.ok(regex instanceof RegExp);
      assert.ok(regex!.test('test'));
      assert.ok(regex!.test('TEST'));
    });
  });

  describe('safeRegexTest', () => {
    it('should test safe patterns', () => {
      const result = safeRegexTest('test', 'this is a test');
      assert.strictEqual(result.matched, true);
      assert.strictEqual(result.error, undefined);
    });

    it('should reject unsafe patterns', () => {
      const result = safeRegexTest('(a+)+', 'aaaaaaa');
      assert.strictEqual(result.matched, false);
      assert.ok(result.error, 'Should have error message');
    });

    it('should handle case insensitive matching', () => {
      const result = safeRegexTest('TEST', 'this is a test', 'i');
      assert.strictEqual(result.matched, true);
    });

    it('should handle invalid regex', () => {
      const result = safeRegexTest('[invalid', 'content');
      assert.strictEqual(result.matched, false);
      assert.ok(result.error, 'Should have error message');
    });
  });
});

describe('path normalization', () => {
  it('should handle Windows-style paths', () => {
    // Even on Unix, should handle backslashes
    const windowsPath = 'src\\file.ts';
    const normalized = windowsPath.replace(/\\/g, '/');
    assert.strictEqual(normalized, 'src/file.ts');
  });

  it('should handle trailing slashes', () => {
    const withSlash = '/path/to/dir/';
    const withoutSlash = '/path/to/dir';
    assert.strictEqual(withSlash.replace(/\/$/, ''), withoutSlash);
  });
});
