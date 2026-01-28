/**
 * Tests for profile loading and validation
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';

import { loadProfile, loadDefaultProfile, listProfiles } from '../src/profiles/index.js';
import type { Level, Pillar } from '../src/types.js';

describe('Profile loading', () => {
  describe('loadDefaultProfile', () => {
    it('should load factory_compat profile by default', async () => {
      const profile = await loadDefaultProfile();

      assert.ok(profile, 'Should return profile');
      assert.ok(profile.name, 'Should have name');
      assert.ok(profile.version, 'Should have version');
      assert.ok(Array.isArray(profile.checks), 'Should have checks array');
    });

    it('should have valid profile structure', async () => {
      const profile = await loadDefaultProfile();

      assert.strictEqual(typeof profile.name, 'string');
      assert.strictEqual(typeof profile.version, 'string');
      assert.ok(profile.checks.length > 0, 'Should have checks');
    });
  });

  describe('loadProfile by name', () => {
    it('should load factory_compat profile', async () => {
      const profile = await loadProfile('factory_compat');

      assert.ok(profile);
      assert.ok(profile.checks.length > 0);
    });

    it('should throw for non-existent profile', async () => {
      await assert.rejects(
        async () => loadProfile('nonexistent_profile_12345'),
        /not found/i,
        'Should throw for missing profile'
      );
    });
  });

  describe('listProfiles', () => {
    it('should return array of profile names', () => {
      const profiles = listProfiles();

      assert.ok(Array.isArray(profiles));
      assert.ok(profiles.includes('factory_compat'));
    });
  });
});

describe('Profile checks structure', () => {
  it('should have all required check fields', async () => {
    const profile = await loadDefaultProfile();

    for (const check of profile.checks) {
      assert.ok(check.id, `Check should have id`);
      assert.ok(check.name, `Check ${check.id} should have name`);
      assert.ok(check.type, `Check ${check.id} should have type`);
      assert.ok(check.pillar, `Check ${check.id} should have pillar`);
      assert.ok(check.level, `Check ${check.id} should have level`);
    }
  });

  it('should have valid pillar values', async () => {
    const profile = await loadDefaultProfile();
    const validPillars: Pillar[] = [
      'docs',
      'style',
      'build',
      'test',
      'security',
      'observability',
      'env',
      'task_discovery',
      'product',
      'agent_config',
      'code_quality',
    ];

    for (const check of profile.checks) {
      assert.ok(
        validPillars.includes(check.pillar),
        `Check ${check.id} has invalid pillar: ${check.pillar}`
      );
    }
  });

  it('should have valid level values', async () => {
    const profile = await loadDefaultProfile();
    const validLevels: Level[] = ['L1', 'L2', 'L3', 'L4', 'L5'];

    for (const check of profile.checks) {
      assert.ok(
        validLevels.includes(check.level),
        `Check ${check.id} has invalid level: ${check.level}`
      );
    }
  });

  it('should have valid check types', async () => {
    const profile = await loadDefaultProfile();
    const validTypes = [
      'file_exists',
      'path_glob',
      'any_of',
      'github_workflow_event',
      'github_action_present',
      'build_command_detect',
      'dependency_detect',
      'log_framework_detect',
      'git_freshness',
      'command_exists',
    ];

    for (const check of profile.checks) {
      assert.ok(
        validTypes.includes(check.type),
        `Check ${check.id} has invalid type: ${check.type}`
      );
    }
  });

  it('should have checks for all pillars', async () => {
    const profile = await loadDefaultProfile();
    const pillars: Pillar[] = [
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

    for (const pillar of pillars) {
      const checksForPillar = profile.checks.filter((c) => c.pillar === pillar);
      assert.ok(checksForPillar.length > 0, `Should have checks for ${pillar} pillar`);
    }
  });

  it('should have checks for core levels', async () => {
    const profile = await loadDefaultProfile();
    // At minimum, should have L1-L3 checks
    const coreLevels: Level[] = ['L1', 'L2', 'L3'];

    for (const level of coreLevels) {
      const checksForLevel = profile.checks.filter((c) => c.level === level);
      assert.ok(checksForLevel.length > 0, `Should have checks for ${level}`);
    }
  });

  it('should only use valid levels', async () => {
    const profile = await loadDefaultProfile();
    const validLevels: Level[] = ['L1', 'L2', 'L3', 'L4', 'L5'];

    for (const check of profile.checks) {
      assert.ok(
        validLevels.includes(check.level),
        `Check ${check.id} has invalid level: ${check.level}`
      );
    }
  });
});

describe('Profile check IDs', () => {
  it('should have unique check IDs', async () => {
    const profile = await loadDefaultProfile();
    const ids = new Set<string>();

    for (const check of profile.checks) {
      assert.ok(!ids.has(check.id), `Duplicate check ID: ${check.id}`);
      ids.add(check.id);
    }
  });

  it('should follow naming convention', async () => {
    const profile = await loadDefaultProfile();

    for (const check of profile.checks) {
      // IDs should be lowercase with dots and underscores
      assert.ok(/^[a-z0-9._]+$/.test(check.id), `Check ID should be lowercase: ${check.id}`);

      // IDs should start with pillar name
      assert.ok(
        check.id.startsWith(check.pillar + '.'),
        `Check ${check.id} should start with ${check.pillar}.`
      );
    }
  });
});

describe('any_of checks', () => {
  it('should have nested checks array', async () => {
    const profile = await loadDefaultProfile();
    const anyOfChecks = profile.checks.filter((c) => c.type === 'any_of');

    for (const check of anyOfChecks) {
      if ('checks' in check) {
        assert.ok(Array.isArray(check.checks), `any_of check ${check.id} should have checks array`);
        assert.ok(
          check.checks.length > 0,
          `any_of check ${check.id} should have at least one nested check`
        );
      }
    }
  });
});

describe('file_exists checks', () => {
  it('should have path property', async () => {
    const profile = await loadDefaultProfile();
    const fileExistsChecks = profile.checks.filter((c) => c.type === 'file_exists');

    for (const check of fileExistsChecks) {
      if ('path' in check) {
        assert.ok(check.path, `file_exists check ${check.id} should have path`);
      }
    }
  });
});

describe('dependency_detect checks', () => {
  it('should have packages array', async () => {
    const profile = await loadDefaultProfile();
    const depChecks = profile.checks.filter((c) => c.type === 'dependency_detect');

    for (const check of depChecks) {
      if ('packages' in check) {
        assert.ok(
          Array.isArray(check.packages),
          `dependency_detect check ${check.id} should have packages array`
        );
        assert.ok(
          check.packages.length > 0,
          `dependency_detect check ${check.id} should have at least one package`
        );
      }
    }
  });
});
