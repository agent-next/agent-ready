/**
 * Tests for scan engine (context building, language detection)
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';

import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildScanContext } from '../src/engine/context.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, 'fixtures');

describe('language detection', () => {
  it('should detect typescript when tsconfig.json exists', async () => {
    const ctx = await buildScanContext(path.join(FIXTURES, 'standard-repo'));
    assert.strictEqual(ctx.language, 'typescript');
  });

  it('should detect python when pyproject.toml exists', async () => {
    const ctx = await buildScanContext(path.join(FIXTURES, 'python-repo'));
    assert.strictEqual(ctx.language, 'python');
  });

  it('should detect unknown for empty repo', async () => {
    const ctx = await buildScanContext(path.join(FIXTURES, 'empty-repo'));
    assert.strictEqual(ctx.language, 'unknown');
  });

  it('should detect javascript for package.json without tsconfig.json', async () => {
    const ctx = await buildScanContext(path.join(FIXTURES, 'minimal-repo'));
    // minimal-repo has package.json but no tsconfig.json
    assert.strictEqual(ctx.language, 'javascript');
  });
});
