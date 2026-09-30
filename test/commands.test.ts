/**
 * In-process tests for the CLI commands and the CLI entry point.
 *
 * Kept in-process (and tsx-spawned for src/index.ts) so c8 can attribute
 * coverage to src/commands/* and src/index.ts without a build step.
 */

import { describe, it, mock } from 'node:test';
import * as assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkCommand } from '../src/commands/check.js';
import { initCommand } from '../src/commands/init.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const FIXTURES_DIR = path.join(__dirname, 'fixtures');

class ExitSignal extends Error {
  constructor(public code: number | undefined) {
    super(`exit:${code}`);
  }
}

interface Captured {
  out: string;
  err: string;
  exitCode?: number;
}

async function capture(fn: () => Promise<void>): Promise<Captured> {
  const out: string[] = [];
  const err: string[] = [];
  const log = mock.method(console, 'log', (...a: unknown[]) => void out.push(a.join(' ')));
  const error = mock.method(console, 'error', (...a: unknown[]) => void err.push(a.join(' ')));
  const exit = mock.method(process, 'exit', (code?: number) => {
    throw new ExitSignal(code);
  });
  const result: Captured = { out: '', err: '' };
  try {
    await fn();
  } catch (e) {
    if (!(e instanceof ExitSignal)) throw e;
    result.exitCode = e.code;
  } finally {
    log.mock.restore();
    error.mock.restore();
    exit.mock.restore();
  }
  result.out = out.join('\n');
  result.err = err.join('\n');
  return result;
}

// A non-string path makes the underlying checker reject, exercising the error branch.
const NOT_A_PATH = 42 as unknown as string;

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'agent-ready-cmd-'));
}

describe('checkCommand', () => {
  it('prints project header and area statuses in human mode', async () => {
    const r = await capture(() => checkCommand(path.join(FIXTURES_DIR, 'standard-repo'), {}));
    assert.strictEqual(r.exitCode, undefined);
    assert.match(r.out, /Project: .+ \(.+\)/);
    assert.match(r.out, /agent_guidance: (complete|partial|missing|unknown)/);
  });

  it('prints missing items for an empty repo', async () => {
    const r = await capture(() => checkCommand(path.join(FIXTURES_DIR, 'empty-repo'), {}));
    assert.match(r.out, /missing: /);
  });

  it('emits parseable JSON with --json', async () => {
    const r = await capture(() =>
      checkCommand(path.join(FIXTURES_DIR, 'standard-repo'), { json: true })
    );
    const parsed = JSON.parse(r.out);
    assert.ok(parsed.data.areas, 'JSON should contain data.areas');
  });

  it('exits 1 with --strict when an area is incomplete', async () => {
    const r = await capture(() =>
      checkCommand(path.join(FIXTURES_DIR, 'empty-repo'), { strict: true })
    );
    assert.strictEqual(r.exitCode, 1);
  });

  it('exits 1 with --json --strict when an area is incomplete', async () => {
    const r = await capture(() =>
      checkCommand(path.join(FIXTURES_DIR, 'empty-repo'), { json: true, strict: true })
    );
    assert.strictEqual(r.exitCode, 1);
    assert.ok(JSON.parse(r.out).data.areas);
  });

  it('reports a checker failure as JSON error and exits 1', async () => {
    const r = await capture(() => checkCommand(NOT_A_PATH, { json: true }));
    assert.strictEqual(r.exitCode, 1);
    const parsed = JSON.parse(r.out);
    assert.strictEqual(parsed.ok, false);
    assert.ok(parsed.error.length > 0);
  });

  it('reports a checker failure on stderr in human mode and exits 1', async () => {
    const r = await capture(() => checkCommand(NOT_A_PATH, {}));
    assert.strictEqual(r.exitCode, 1);
    assert.match(r.err, /^Error: /);
  });
});

describe('initCommand', () => {
  it('exits 1 when the path does not exist', async () => {
    const missing = path.join(os.tmpdir(), 'agent-ready-does-not-exist-' + process.pid);
    const r = await capture(() => initCommand({ path: missing }));
    assert.strictEqual(r.exitCode, 1);
    assert.match(r.err, /Path does not exist/);
  });

  it('exits 1 for an unknown --check id', async () => {
    const dir = tmpDir();
    try {
      const r = await capture(() => initCommand({ path: dir, check: 'nope.nothing' }));
      assert.strictEqual(r.exitCode, 1);
      assert.match(r.err, /No template found for check: nope.nothing/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('lists files without writing them on --dry-run', async () => {
    const dir = tmpDir();
    try {
      const r = await capture(() => initCommand({ path: dir, dryRun: true }));
      assert.match(r.out, /Would create the following files/);
      assert.deepStrictEqual(fs.readdirSync(dir), []);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('creates files with substituted variables, then reports nothing left to do', async () => {
    const dir = tmpDir();
    try {
      fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'demo-pkg' }));
      const first = await capture(() =>
        initCommand({ path: dir, check: 'agent_guidance.agents_md' })
      );
      assert.match(first.out, /Created: AGENTS.md/);
      const content = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf-8');
      assert.ok(!content.includes('{{PROJECT_NAME}}'), 'placeholders should be substituted');

      const second = await capture(() =>
        initCommand({ path: dir, check: 'agent_guidance.agents_md' })
      );
      assert.match(second.out, /All required files already exist/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('falls back to the directory name when package.json is invalid', async () => {
    const dir = tmpDir();
    try {
      fs.writeFileSync(path.join(dir, 'package.json'), '{not json');
      const r = await capture(() => initCommand({ path: dir, check: 'agent_guidance.agents_md' }));
      assert.match(r.out, /Created 1 file/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('overwrites existing files with --force', async () => {
    const dir = tmpDir();
    try {
      fs.writeFileSync(path.join(dir, 'AGENTS.md'), 'sentinel');
      await capture(() =>
        initCommand({ path: dir, check: 'agent_guidance.agents_md', force: true })
      );
      assert.notStrictEqual(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf-8'), 'sentinel');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reports write failures as "Init failed" and exits 1', async () => {
    const dir = tmpDir();
    try {
      // A file where a directory is required makes the template write fail.
      fs.writeFileSync(path.join(dir, '.github'), 'not a directory');
      const r = await capture(() => initCommand({ path: dir }));
      assert.strictEqual(r.exitCode, 1);
      assert.match(r.err, /Init failed/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('CLI entry point (src/index.ts)', () => {
  function runEntry(args: string[], cwd = ROOT_DIR) {
    return spawnSync(
      process.execPath,
      ['--import', 'tsx', path.join(ROOT_DIR, 'src/index.ts'), ...args],
      { encoding: 'utf-8', cwd, env: { ...process.env, LOG_LEVEL: 'silent' } }
    );
  }

  it('prints the package version', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8'));
    const r = runEntry(['--version']);
    assert.strictEqual(r.status, 0);
    assert.strictEqual(r.stdout.trim(), pkg.version);
  });

  it('routes the check command', () => {
    const r = runEntry(['check', path.join(FIXTURES_DIR, 'standard-repo'), '--json']);
    assert.strictEqual(r.status, 0);
    assert.ok(JSON.parse(r.stdout).data.areas);
  });

  it('routes the init command with its options', () => {
    const r = runEntry([
      'init',
      path.join(FIXTURES_DIR, 'empty-repo'),
      '--dry-run',
      '--check',
      'agent_guidance.agents_md',
    ]);
    assert.strictEqual(r.status, 0);
    assert.match(r.stdout, /AGENTS.md/);
  });
});

describe('coverage config (.c8rc.json)', () => {
  const c8rc = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, '.c8rc.json'), 'utf-8'));

  it('keeps the CLI entry point src/index.ts inside the coverage gate', () => {
    for (const pattern of c8rc.exclude as string[]) {
      assert.ok(!path.matchesGlob('src/index.ts', pattern), `${pattern} excludes src/index.ts`);
    }
  });

  it('still excludes nested re-export barrels', () => {
    const excluded = (c8rc.exclude as string[]).some((p) =>
      path.matchesGlob('src/engine/index.ts', p)
    );
    assert.ok(excluded);
  });

  it('keeps src/templates/index.ts (real loader logic) inside the coverage gate', () => {
    for (const pattern of c8rc.exclude as string[]) {
      assert.ok(
        !path.matchesGlob('src/templates/index.ts', pattern),
        `${pattern} excludes src/templates/index.ts`
      );
    }
  });
});
