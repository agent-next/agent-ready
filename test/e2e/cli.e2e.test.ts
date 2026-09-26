/**
 * End-to-end tests for agent-ready CLI
 *
 * Tests the complete CLI functionality including:
 * - check command with various options
 * - init command with various options
 * - error handling
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../..');
const FIXTURES_DIR = path.join(__dirname, '../fixtures');
const CLI = path.join(ROOT_DIR, 'dist/index.js');

interface CLIResult {
  stdout: string;
  stderr: string;
  status: number;
}

function runCLI(args: string[], cwd?: string): CLIResult {
  const result = spawnSync('node', [CLI, ...args], {
    encoding: 'utf-8',
    cwd: cwd || ROOT_DIR,
    env: { ...process.env, NODE_ENV: 'test' },
  });
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    status: result.status || 0,
  };
}

describe('E2E: CLI check command', () => {
  it('should check current directory and produce output', () => {
    const { stdout, status } = runCLI(['check', '.']);
    assert.strictEqual(status, 0, 'CLI should exit with code 0');
    assert.ok(stdout.length > 0, 'Should produce output');
  });

  it('should check with --json flag', () => {
    const { stdout, status } = runCLI(['check', '.', '--json']);
    assert.strictEqual(status, 0);
    const result = JSON.parse(stdout);
    assert.strictEqual(result.ok, true, 'Should have ok: true');
    assert.ok(result.data.areas, 'Should have areas');
    assert.ok(result.data.project_type, 'Should have project_type');
    assert.ok(result.data.language, 'Should have language');
  });

  it('should check with --strict flag and exit 1 if missing', () => {
    const tempDir = fs.mkdtempSync('/tmp/agent-ready-strict-');
    try {
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{"name":"test"}');
      const { status } = runCLI(['check', tempDir, '--strict']);
      // Temp dir will be missing items, so should exit 1
      assert.strictEqual(status, 1, 'Strict mode should exit 1 for incomplete repo');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should include 9 areas in JSON output', () => {
    const { stdout, status } = runCLI(['check', '.', '--json']);
    assert.strictEqual(status, 0);
    const result = JSON.parse(stdout);
    const areas = Object.keys(result.data.areas);
    const expectedAreas = [
      'agent_guidance',
      'code_quality',
      'testing',
      'ci_cd',
      'hooks',
      'branch_rulesets',
      'templates',
      'devcontainer',
      'security',
    ];
    for (const area of expectedAreas) {
      assert.ok(areas.includes(area), `Should have ${area} area`);
    }
  });
});

describe('E2E: CLI init command', () => {
  it('should run init with dry-run flag', () => {
    const { status } = runCLI(['init', '.', '--dry-run']);
    assert.strictEqual(status, 0, 'Dry run should succeed');
  });

  it('should support --check flag for specific check', () => {
    const tempDir = fs.mkdtempSync('/tmp/agent-ready-check-');
    try {
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{"name":"test"}');
      const { status } = runCLI(['init', tempDir, '--check', 'docs.readme', '--dry-run']);
      assert.ok(status === 0 || status === 1, 'Should handle check flag');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe('E2E: CLI error handling', () => {
  it('should display help with --help flag', () => {
    const { stdout, status } = runCLI(['--help']);
    assert.strictEqual(status, 0);
    assert.ok(stdout.includes('check') || stdout.includes('Usage'), 'Should show help');
  });

  it('should display version with --version flag', () => {
    const { stdout, status } = runCLI(['--version']);
    assert.strictEqual(status, 0);
    assert.ok(/\d+\.\d+\.\d+/.test(stdout), 'Should show version number');
  });
});

describe('E2E: Performance', () => {
  it('should complete check within reasonable time', () => {
    const start = Date.now();
    const { status } = runCLI(['check', '.', '--json']);
    const duration = Date.now() - start;
    assert.strictEqual(status, 0);
    assert.ok(duration < 30000, `Check should complete within 30s (took ${duration}ms)`);
  });
});
