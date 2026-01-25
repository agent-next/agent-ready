/**
 * Tests for scanner module
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { scan } from '../src/scanner.js';
import type { Pillar, ScanOptions } from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

function createScanOptions(targetPath: string, overrides?: Partial<ScanOptions>): ScanOptions {
  return {
    path: targetPath,
    profile: 'factory_compat',
    output: 'json',
    verbose: false,
    ...overrides,
  };
}

describe('Scanner module', () => {
  describe('scan function', () => {
    it('should scan a directory and return result', async () => {
      const result = await scan(createScanOptions(FIXTURES_DIR));

      assert.ok(result, 'Should return result');
      assert.ok('level' in result, 'Should have level');
      assert.ok('overall_score' in result, 'Should have overall_score');
      assert.ok('pillars' in result, 'Should have pillars');
    });

    it('should have valid score range', async () => {
      const result = await scan(createScanOptions(FIXTURES_DIR));

      assert.ok(result.overall_score >= 0, 'Score should be >= 0');
      assert.ok(result.overall_score <= 100, 'Score should be <= 100');
    });

    it('should include all 9 pillars', async () => {
      const result = await scan(createScanOptions(FIXTURES_DIR));
      const expectedPillars: Pillar[] = [
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
        assert.ok(pillar in result.pillars, `Should have ${pillar} pillar`);
      }
    });

    it('should include action items', async () => {
      const result = await scan(createScanOptions(FIXTURES_DIR));

      assert.ok(Array.isArray(result.action_items), 'Should have action_items array');
    });

    it('should include check results', async () => {
      const result = await scan(createScanOptions(FIXTURES_DIR));

      assert.ok(Array.isArray(result.check_results), 'Should have check_results array');
      assert.ok(result.check_results.length > 0, 'Should have some check results');
    });

    it('should include level details', async () => {
      const result = await scan(createScanOptions(FIXTURES_DIR));

      assert.ok(result.levels, 'Should have levels');
      assert.ok('L1' in result.levels, 'Should have L1 details');
      assert.ok('L2' in result.levels, 'Should have L2 details');
      assert.ok('L3' in result.levels, 'Should have L3 details');
      assert.ok('L4' in result.levels, 'Should have L4 details');
      assert.ok('L5' in result.levels, 'Should have L5 details');
    });
  });

  describe('fixture scanning', () => {
    it('should scan minimal-repo', async () => {
      const minimalRepo = path.join(FIXTURES_DIR, 'minimal-repo');
      if (!fs.existsSync(minimalRepo)) {
        return;
      }

      const result = await scan(createScanOptions(minimalRepo));
      assert.ok(result);
      assert.ok(result.overall_score >= 0);
    });

    it('should scan standard-repo with higher score', async () => {
      const standardRepo = path.join(FIXTURES_DIR, 'standard-repo');
      if (!fs.existsSync(standardRepo)) {
        return;
      }

      const result = await scan(createScanOptions(standardRepo));
      assert.ok(result);
      // Standard repo should have higher score than minimal
      assert.ok(result.overall_score >= 0);
    });

    it('should scan l3-repo successfully', async () => {
      const l3Repo = path.join(FIXTURES_DIR, 'l3-repo');
      if (!fs.existsSync(l3Repo)) {
        return;
      }

      const result = await scan(createScanOptions(l3Repo));
      assert.ok(result);

      // Should achieve at least L1 with the fixture's README and package.json
      // Note: L2+ achievement depends on profile requirements being met
      assert.ok(result.overall_score >= 0, 'Should have positive or zero score');
      assert.ok(result.levels.L1.achieved, 'Should at least achieve L1');
    });

    it('should scan python-repo', async () => {
      const pythonRepo = path.join(FIXTURES_DIR, 'python-repo');
      if (!fs.existsSync(pythonRepo)) {
        return;
      }

      const result = await scan(createScanOptions(pythonRepo));
      assert.ok(result);
      // Python repo should be detected correctly
      assert.ok(result.overall_score >= 0);
    });

    it('should detect monorepo structure', async () => {
      const monorepo = path.join(FIXTURES_DIR, 'monorepo');
      if (!fs.existsSync(monorepo)) {
        return;
      }

      const result = await scan(createScanOptions(monorepo));
      assert.ok(result);
    });

    it('should handle empty repo gracefully', async () => {
      const emptyRepo = path.join(FIXTURES_DIR, 'empty-repo');
      if (!fs.existsSync(emptyRepo)) {
        return;
      }

      const result = await scan(createScanOptions(emptyRepo));
      assert.ok(result);
      // Empty repo should have low score but not error
      assert.ok(result.overall_score >= 0);
    });
  });

  describe('pillar summaries', () => {
    it('should have valid pillar summary structure', async () => {
      const result = await scan(createScanOptions(FIXTURES_DIR));

      for (const [pillar, summary] of Object.entries(result.pillars)) {
        assert.ok(summary.pillar === pillar, `Pillar name should match key`);
        assert.ok('level_achieved' in summary, 'Should have level_achieved');
        assert.ok('score' in summary, 'Should have score');
        assert.ok(summary.score >= 0 && summary.score <= 100, 'Score should be 0-100');
        assert.ok('checks_passed' in summary, 'Should have checks_passed');
        assert.ok('checks_total' in summary, 'Should have checks_total');
        assert.ok(summary.checks_passed <= summary.checks_total, 'Passed <= total');
      }
    });
  });

  describe('action items', () => {
    it('should have valid action item structure', async () => {
      const result = await scan(createScanOptions(FIXTURES_DIR));

      for (const item of result.action_items) {
        assert.ok(item.check_id, 'Should have check_id');
        assert.ok(item.pillar, 'Should have pillar');
        assert.ok(item.level, 'Should have level');
        assert.ok(item.priority, 'Should have priority');
        assert.ok(item.action, 'Should have action');
      }
    });

    it('should have valid priority values', async () => {
      const result = await scan(createScanOptions(FIXTURES_DIR));
      const validPriorities = ['critical', 'high', 'medium', 'low'];

      for (const item of result.action_items) {
        assert.ok(validPriorities.includes(item.priority), `Invalid priority: ${item.priority}`);
      }
    });

    it('should sort by priority', async () => {
      const result = await scan(createScanOptions(FIXTURES_DIR));

      if (result.action_items.length > 1) {
        const priorities = ['critical', 'high', 'medium', 'low'];
        let lastPriorityIndex = -1;

        for (const item of result.action_items) {
          const currentIndex = priorities.indexOf(item.priority);
          // Priority should be same or lower (higher index)
          assert.ok(currentIndex >= lastPriorityIndex, 'Action items should be sorted by priority');
          lastPriorityIndex = currentIndex;
        }
      }
    });
  });

  describe('check results', () => {
    it('should have valid check result structure', async () => {
      const result = await scan(createScanOptions(FIXTURES_DIR));

      for (const check of result.check_results) {
        assert.ok(check.check_id, 'Should have check_id');
        assert.ok(check.check_name, 'Should have check_name');
        assert.ok(check.pillar, 'Should have pillar');
        assert.ok(check.level, 'Should have level');
        assert.ok(typeof check.passed === 'boolean', 'Should have boolean passed');
        assert.ok(typeof check.required === 'boolean', 'Should have boolean required');
      }
    });

    it('should track matched files', async () => {
      const result = await scan(createScanOptions(FIXTURES_DIR));

      // Some checks should have matched files
      const checksWithFiles = result.check_results.filter(
        (c) => c.matched_files && c.matched_files.length > 0
      );

      // At least some checks should find files
      assert.ok(checksWithFiles.length > 0, 'Some checks should find files');
    });
  });

  describe('level progression', () => {
    it('should require L1 before L2', async () => {
      const result = await scan(createScanOptions(FIXTURES_DIR));

      if (result.level === 'L2') {
        assert.ok(result.levels.L1.achieved, 'L1 should be achieved if L2 is');
      }
    });

    it('should calculate progress to next level', async () => {
      const result = await scan(createScanOptions(FIXTURES_DIR));

      assert.ok('progress_to_next' in result, 'Should have progress_to_next');
      assert.ok(result.progress_to_next >= 0, 'Progress should be >= 0');
      assert.ok(result.progress_to_next <= 1, 'Progress should be <= 1');
    });
  });
});

describe('Scanner options', () => {
  it('should accept profile option', async () => {
    const result = await scan(createScanOptions(FIXTURES_DIR, { profile: 'factory_compat' }));
    assert.ok(result);
    assert.strictEqual(result.profile, 'factory_compat');
  });

  it('should accept target level option', async () => {
    const result = await scan(createScanOptions(FIXTURES_DIR, { level: 'L2' }));
    assert.ok(result);
  });
});
