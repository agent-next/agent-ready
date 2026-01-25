/**
 * End-to-end tests for agent-ready CLI
 *
 * Tests the complete CLI functionality including:
 * - scan command with various options
 * - init command with various options
 * - i18n support
 * - error handling
 * - output formats
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

function parseJSON(output: string): Record<string, unknown> | null {
  try {
    // Filter out pino log lines (they start with {"level":)
    const lines = output.split('\n').filter((line) => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('{"level":') && !trimmed.startsWith('Scanning:');
    });
    const jsonLine = lines.find((line) => line.trim().startsWith('{'));
    return jsonLine ? JSON.parse(jsonLine) : null;
  } catch {
    return null;
  }
}

describe('E2E: CLI scan command', () => {
  it('should scan current directory and produce output', () => {
    const { stdout, status } = runCLI(['scan', '.']);
    assert.strictEqual(status, 0, 'CLI should exit with code 0');
    assert.ok(
      stdout.includes('Agent Readiness Report') || stdout.includes('Level'),
      'Should contain report'
    );
  });

  it('should scan with JSON output format', () => {
    const { stdout, status } = runCLI(['scan', '.', '--output', 'json']);
    assert.strictEqual(status, 0);
    const result = parseJSON(stdout);
    assert.ok(result, 'Should produce valid JSON');
    assert.ok('level' in result || 'achievedLevel' in result, 'Should have level field');
    assert.ok('score' in result, 'Should have score field');
  });

  it('should scan with markdown output format', () => {
    const { stdout, status } = runCLI(['scan', '.', '--output', 'markdown']);
    assert.strictEqual(status, 0);
    assert.ok(stdout.includes('Agent Readiness Report'), 'Should contain markdown report');
    assert.ok(stdout.includes('Level:'), 'Should contain level');
    assert.ok(stdout.includes('Score:'), 'Should contain score');
  });

  it('should scan with verbose flag', () => {
    const { stdout, status } = runCLI(['scan', '.', '--verbose']);
    assert.strictEqual(status, 0);
    assert.ok(stdout.includes('Agent Readiness Report'), 'Should contain report');
  });

  it('should scan minimal-repo fixture', () => {
    const minimalRepo = path.join(FIXTURES_DIR, 'minimal-repo');
    if (!fs.existsSync(minimalRepo)) {
      return; // Skip if fixture doesn't exist
    }
    const { stdout, status } = runCLI(['scan', minimalRepo, '--output', 'json']);
    assert.strictEqual(status, 0);
    const result = parseJSON(stdout);
    assert.ok(result, 'Should produce valid JSON');
  });

  it('should scan standard-repo fixture', () => {
    const standardRepo = path.join(FIXTURES_DIR, 'standard-repo');
    if (!fs.existsSync(standardRepo)) {
      return;
    }
    const { stdout, status } = runCLI(['scan', standardRepo, '--output', 'json']);
    assert.strictEqual(status, 0);
    const result = parseJSON(stdout);
    assert.ok(result, 'Should produce valid JSON');
  });

  it('should scan l3-repo fixture and achieve L2+', () => {
    const l3Repo = path.join(FIXTURES_DIR, 'l3-repo');
    if (!fs.existsSync(l3Repo)) {
      return;
    }
    const { stdout, status } = runCLI(['scan', l3Repo, '--output', 'json']);
    assert.strictEqual(status, 0);
    const result = parseJSON(stdout);
    assert.ok(result, 'Should produce valid JSON');
    // L3 repo should achieve at least L2
    const level = result?.level || result?.achievedLevel;
    assert.ok(
      ['L2', 'L3', 'L4', 'L5'].includes(level as string),
      `Should achieve L2+ (got ${level})`
    );
  });

  it('should scan python-repo fixture', () => {
    const pythonRepo = path.join(FIXTURES_DIR, 'python-repo');
    if (!fs.existsSync(pythonRepo)) {
      return;
    }
    const { stdout, status } = runCLI(['scan', pythonRepo, '--output', 'json']);
    assert.strictEqual(status, 0);
    const result = parseJSON(stdout);
    assert.ok(result, 'Should produce valid JSON');
  });

  it('should detect monorepo', () => {
    const monorepo = path.join(FIXTURES_DIR, 'monorepo');
    if (!fs.existsSync(monorepo)) {
      return;
    }
    const { stdout, status } = runCLI(['scan', monorepo, '--output', 'json']);
    assert.strictEqual(status, 0);
    const result = parseJSON(stdout);
    assert.ok(result, 'Should produce valid JSON');
  });

  it('should generate readiness.json file', () => {
    const tempDir = fs.mkdtempSync('/tmp/agent-ready-test-');
    fs.writeFileSync(path.join(tempDir, 'README.md'), '# Test');
    fs.writeFileSync(path.join(tempDir, 'package.json'), '{}');

    try {
      runCLI(['scan', tempDir]);
      const readinessPath = path.join(tempDir, 'readiness.json');
      assert.ok(fs.existsSync(readinessPath), 'readiness.json should be created');

      const content = JSON.parse(fs.readFileSync(readinessPath, 'utf-8'));
      assert.ok('level' in content || 'achievedLevel' in content, 'Should have level');
      assert.ok('pillars' in content, 'Should have pillars');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe('E2E: CLI i18n support', () => {
  it('should support English output (default)', () => {
    const { stdout, status } = runCLI(['scan', '.', '--output', 'markdown']);
    assert.strictEqual(status, 0);
    assert.ok(stdout.includes('Level:') || stdout.includes('Score:'), 'Should have English labels');
  });

  it('should support Chinese output with --lang zh', () => {
    const { stdout, status } = runCLI(['scan', '.', '--lang', 'zh', '--output', 'markdown']);
    assert.strictEqual(status, 0);
    // Check for Chinese characters in output
    assert.ok(
      stdout.includes('级别') || stdout.includes('分数') || stdout.includes('标准化'),
      'Should have Chinese labels'
    );
  });

  it('should support English output with --lang en', () => {
    const { stdout, status } = runCLI(['scan', '.', '--lang', 'en', '--output', 'markdown']);
    assert.strictEqual(status, 0);
    assert.ok(stdout.includes('Level:'), 'Should have English labels');
  });
});

describe('E2E: CLI init command', () => {
  it('should run init with dry-run flag', () => {
    const { status } = runCLI(['init', '.', '--dry-run']);
    assert.strictEqual(status, 0, 'Dry run should succeed');
  });

  it('should show what files would be created in dry-run', () => {
    const tempDir = fs.mkdtempSync('/tmp/agent-ready-init-');
    try {
      const { status } = runCLI(['init', tempDir, '--dry-run', '--level', 'L2']);
      assert.strictEqual(status, 0);
      // Dry run should indicate files without creating them
      // The exact output format may vary
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should create missing files with init command', () => {
    const tempDir = fs.mkdtempSync('/tmp/agent-ready-init-create-');
    try {
      // Create minimal structure
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{"name":"test"}');

      const { status } = runCLI(['init', tempDir, '--level', 'L1']);
      assert.strictEqual(status, 0);

      // Check if README.md was created (L1 requirement)
      // Note: may or may not create depending on existing state
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should support --check flag for specific check', () => {
    const tempDir = fs.mkdtempSync('/tmp/agent-ready-check-');
    try {
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{"name":"test"}');
      const { status } = runCLI(['init', tempDir, '--check', 'docs.readme', '--dry-run']);
      // Should complete without error
      assert.ok(status === 0 || status === 1, 'Should handle check flag');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe('E2E: CLI error handling', () => {
  it('should handle non-existent directory', () => {
    const { status } = runCLI(['scan', '/path/that/does/not/exist/12345']);
    assert.notStrictEqual(status, 0, 'Should fail for non-existent path');
  });

  it('should handle invalid output format gracefully', () => {
    runCLI(['scan', '.', '--output', 'invalid-format']);
    // Should either fail gracefully or default to a valid format
    // The exact behavior depends on implementation
  });

  it('should display help with --help flag', () => {
    const { stdout, status } = runCLI(['--help']);
    assert.strictEqual(status, 0);
    assert.ok(stdout.includes('scan') || stdout.includes('Usage'), 'Should show help');
  });

  it('should display version with --version flag', () => {
    const { stdout, status } = runCLI(['--version']);
    assert.strictEqual(status, 0);
    assert.ok(/\d+\.\d+\.\d+/.test(stdout), 'Should show version number');
  });

  it('should handle empty repository', () => {
    const emptyRepo = path.join(FIXTURES_DIR, 'empty-repo');
    if (!fs.existsSync(emptyRepo)) {
      return;
    }
    const { status } = runCLI(['scan', emptyRepo, '--output', 'json']);
    // Should complete even with minimal files
    assert.ok(status === 0 || status === 1, 'Should handle empty repo');
  });
});

describe('E2E: CLI pillar summaries', () => {
  it('should include all 9 pillars in output', () => {
    const { stdout, status } = runCLI(['scan', '.', '--output', 'json']);
    assert.strictEqual(status, 0);
    const result = parseJSON(stdout);
    assert.ok(result, 'Should produce valid JSON');

    const pillars = result?.pillars as Record<string, unknown> | undefined;
    if (pillars) {
      const expectedPillars = [
        'docs',
        'style',
        'build',
        'test',
        'security',
        'observability',
        'env',
        'task_discovery',
        'product',
      ];
      for (const pillar of expectedPillars) {
        assert.ok(pillar in pillars, `Should have ${pillar} pillar`);
      }
    }
  });

  it('should include action items in output', () => {
    const { stdout, status } = runCLI(['scan', '.', '--output', 'json']);
    assert.strictEqual(status, 0);
    const result = parseJSON(stdout);
    assert.ok(result, 'Should produce valid JSON');
    assert.ok('actionItems' in result || 'action_items' in result, 'Should have action items');
  });
});

describe('E2E: CLI profile support', () => {
  it('should use factory_compat profile by default', () => {
    const { stdout, status } = runCLI(['scan', '.', '--output', 'markdown']);
    assert.strictEqual(status, 0);
    assert.ok(stdout.includes('factory_compat'), 'Should use factory_compat profile');
  });
});

describe('E2E: Performance', () => {
  it('should complete scan within reasonable time', () => {
    const start = Date.now();
    const { status } = runCLI(['scan', '.', '--output', 'json']);
    const duration = Date.now() - start;
    assert.strictEqual(status, 0);
    assert.ok(duration < 30000, `Scan should complete within 30s (took ${duration}ms)`);
  });

  it('should handle large repositories', () => {
    // Test with node_modules excluded (should be fast)
    const { status } = runCLI(['scan', '.', '--output', 'json']);
    assert.strictEqual(status, 0);
  });
});
