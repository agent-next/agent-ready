/**
 * Tests that `check --json` writes pure parseable JSON to stdout.
 * Regression coverage for https://github.com/agent-next/agent-ready/issues/79:
 * pino log records must go to stderr, not stdout.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

describe('check --json', () => {
  it('emits parseable JSON on stdout only', () => {
    const result = spawnSync(
      'npx',
      ['tsx', 'src/index.ts', 'check', 'test/fixtures/minimal-repo', '--json'],
      { cwd: ROOT_DIR, encoding: 'utf-8' }
    );
    assert.strictEqual(result.status, 0, `CLI exited ${result.status}: ${result.stderr}`);
    const parsed = JSON.parse(result.stdout);
    assert.ok(parsed.data?.areas ?? parsed.areas, 'JSON payload should have an areas property');
  });
});
