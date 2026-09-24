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

  it('should link release-gate doc from SKILL.md', () => {
    const skillPath = path.join(SKILL_DIR, 'SKILL.md');
    const content = readFileSync(skillPath, 'utf-8');
    assert.ok(
      content.includes('references/release-gate.md'),
      'SKILL.md should link to references/release-gate.md'
    );
  });
});
