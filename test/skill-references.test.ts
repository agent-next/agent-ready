/**
 * Tests for skill reference docs
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.join(__dirname, '..', 'skill', 'agent-ready');

describe('Skill references', () => {
  it('should have release-gate.md reference doc', () => {
    const docPath = path.join(SKILL_DIR, 'references', 'release-gate.md');
    assert.ok(existsSync(docPath), 'references/release-gate.md should exist');
  });

  it('should define risk tiers, verdicts, and the verdict roll-up', () => {
    const docPath = path.join(SKILL_DIR, 'references', 'release-gate.md');
    const content = readFileSync(docPath, 'utf-8');
    for (const term of ['T0', 'T1', 'T2', 'T3', '`ship`', '`investigate`', '`block`']) {
      assert.ok(content.includes(term), `release-gate.md should mention ${term}`);
    }
    assert.ok(
      content.includes('Never let `investigate` fail the build'),
      'release-gate.md should keep investigate non-blocking'
    );
    assert.ok(
      content.includes('| Any critical mission `fail` with evidence | `block` |'),
      'release-gate.md should map critical mission failure to block'
    );
  });

  it('should link release-gate doc from SKILL.md', () => {
    const skillPath = path.join(SKILL_DIR, 'SKILL.md');
    const content = readFileSync(skillPath, 'utf-8');
    assert.ok(
      content.includes('references/release-gate.md'),
      'SKILL.md should link to references/release-gate.md'
    );
  });
});
