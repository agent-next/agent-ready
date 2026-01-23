#!/usr/bin/env tsx
/**
 * Multi-repo validation test
 * Tests agent-ready against popular open source repos to validate Factory.ai compatibility
 *
 * NOTE: This test script uses execSync with hardcoded, controlled inputs only.
 * No user input is passed to shell commands.
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface RepoConfig {
  name: string;
  url: string;
  language: string;
  expectedLevel?: number; // Factory.ai reported level if known
  expectedPassRate?: number; // Factory.ai reported pass rate if known
}

// Test repos - mix of languages and maturity levels
// Some have Factory.ai published results for comparison
const TEST_REPOS: RepoConfig[] = [
  // TypeScript/JavaScript
  {
    name: 'express',
    url: 'https://github.com/expressjs/express.git',
    language: 'JavaScript',
  },
  {
    name: 'next.js',
    url: 'https://github.com/vercel/next.js.git',
    language: 'TypeScript',
  },
  {
    name: 'vue',
    url: 'https://github.com/vuejs/core.git',
    language: 'TypeScript',
  },
  {
    name: 'react',
    url: 'https://github.com/facebook/react.git',
    language: 'JavaScript',
  },

  // Python
  {
    name: 'flask',
    url: 'https://github.com/pallets/flask.git',
    language: 'Python',
    expectedLevel: 2,
    expectedPassRate: 37,
  },
  {
    name: 'fastapi',
    url: 'https://github.com/tiangolo/fastapi.git',
    language: 'Python',
  },
  {
    name: 'django',
    url: 'https://github.com/django/django.git',
    language: 'Python',
  },

  // Go
  {
    name: 'gin',
    url: 'https://github.com/gin-gonic/gin.git',
    language: 'Go',
  },
  {
    name: 'cobra',
    url: 'https://github.com/spf13/cobra.git',
    language: 'Go',
  },

  // Rust
  {
    name: 'ripgrep',
    url: 'https://github.com/BurntSushi/ripgrep.git',
    language: 'Rust',
  },
  {
    name: 'alacritty',
    url: 'https://github.com/alacritty/alacritty.git',
    language: 'Rust',
  },

  // CLI Tools
  {
    name: 'gh-cli',
    url: 'https://github.com/cli/cli.git',
    language: 'Go',
  },
];

interface TestResult {
  repo: string;
  language: string;
  level: string | null;
  score: number;
  checksTotal: number;
  checksPassed: number;
  expectedLevel?: number;
  expectedPassRate?: number;
  levelMatch?: boolean;
  error?: string;
}

const TEMP_DIR = '/tmp/agent-ready-test-repos';
const RESULTS_FILE = join(process.cwd(), 'test', 'multi-repo-results.json');

function cloneRepo(repo: RepoConfig): string {
  const repoPath = join(TEMP_DIR, repo.name);

  if (existsSync(repoPath)) {
    console.log(`  [SKIP] ${repo.name} already cloned`);
    return repoPath;
  }

  console.log(`  [CLONE] ${repo.name}...`);
  // Safe: hardcoded URLs only, no user input
  execSync(`git clone --depth 1 "${repo.url}" "${repoPath}"`, {
    stdio: 'pipe',
    timeout: 120000,
  });

  return repoPath;
}

function scanRepo(repoPath: string): {
  level: string | null;
  score: number;
  checksTotal: number;
  checksPassed: number;
} {
  // Safe: repoPath is from our controlled TEMP_DIR + hardcoded repo names
  execSync(`npm run dev -- scan "${repoPath}" --output json`, {
    encoding: 'utf-8',
    timeout: 60000,
    cwd: process.cwd(),
    stdio: 'pipe',
  });

  // Read the generated readiness.json
  const readinessPath = join(repoPath, 'readiness.json');
  if (!existsSync(readinessPath)) {
    throw new Error('readiness.json not generated');
  }

  const readiness = JSON.parse(readFileSync(readinessPath, 'utf-8'));

  return {
    level: readiness.level,
    score: readiness.overall_score,
    checksTotal: readiness.check_results?.length || 0,
    checksPassed: readiness.check_results?.filter((c: { passed: boolean }) => c.passed).length || 0,
  };
}

function runTests(): void {
  console.log('='.repeat(60));
  console.log('Agent-Ready Multi-Repo Validation Test');
  console.log('='.repeat(60));
  console.log();

  // Create temp directory
  if (!existsSync(TEMP_DIR)) {
    mkdirSync(TEMP_DIR, { recursive: true });
  }

  const results: TestResult[] = [];

  for (const repo of TEST_REPOS) {
    console.log(`\n[${repo.language}] ${repo.name}`);

    try {
      const repoPath = cloneRepo(repo);
      const scanResult = scanRepo(repoPath);

      const result: TestResult = {
        repo: repo.name,
        language: repo.language,
        level: scanResult.level,
        score: scanResult.score,
        checksTotal: scanResult.checksTotal,
        checksPassed: scanResult.checksPassed,
        expectedLevel: repo.expectedLevel,
        expectedPassRate: repo.expectedPassRate,
      };

      // Compare with Factory.ai if we have expected values
      if (repo.expectedLevel !== undefined) {
        const actualLevel = parseInt(scanResult.level?.replace('L', '') || '0');
        result.levelMatch = actualLevel === repo.expectedLevel;
      }

      results.push(result);

      console.log(
        `  [RESULT] Level: ${scanResult.level || 'None'} | Score: ${scanResult.score}% | Checks: ${scanResult.checksPassed}/${scanResult.checksTotal}`
      );

      if (repo.expectedLevel !== undefined) {
        const match = result.levelMatch ? '✓ MATCH' : '✗ MISMATCH';
        console.log(
          `  [COMPARE] Expected L${repo.expectedLevel} (${repo.expectedPassRate}%) - ${match}`
        );
      }
    } catch (error) {
      console.log(`  [ERROR] ${error}`);
      results.push({
        repo: repo.name,
        language: repo.language,
        level: null,
        score: 0,
        checksTotal: 0,
        checksPassed: 0,
        error: String(error),
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter((r) => !r.error);
  const failed = results.filter((r) => r.error);

  console.log(`\nTotal repos tested: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);

  // Level distribution
  const levelCounts: Record<string, number> = {};
  for (const r of successful) {
    const level = r.level || 'None';
    levelCounts[level] = (levelCounts[level] || 0) + 1;
  }

  console.log('\nLevel Distribution:');
  for (const [level, count] of Object.entries(levelCounts).sort()) {
    console.log(`  ${level}: ${count} repos`);
  }

  // Factory.ai comparison
  const withExpected = successful.filter((r) => r.expectedLevel !== undefined);
  if (withExpected.length > 0) {
    const matches = withExpected.filter((r) => r.levelMatch).length;
    console.log(`\nFactory.ai Comparison:`);
    console.log(`  Repos with known levels: ${withExpected.length}`);
    console.log(`  Level matches: ${matches}/${withExpected.length}`);
  }

  // Save results
  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${RESULTS_FILE}`);

  // Print table
  console.log('\n' + '='.repeat(60));
  console.log('DETAILED RESULTS');
  console.log('='.repeat(60));
  console.log('\n| Repo | Language | Level | Score | Checks | Factory.ai |');
  console.log('|------|----------|-------|-------|--------|------------|');
  for (const r of results) {
    const factoryCol = r.expectedLevel ? `L${r.expectedLevel} (${r.expectedPassRate}%)` : '-';
    const checksCol = r.error ? 'ERROR' : `${r.checksPassed}/${r.checksTotal}`;
    console.log(
      `| ${r.repo.padEnd(12)} | ${r.language.padEnd(10)} | ${(r.level || '-').padEnd(5)} | ${String(r.score).padEnd(5)}% | ${checksCol.padEnd(6)} | ${factoryCol.padEnd(10)} |`
    );
  }
}

// Run if executed directly
runTests();
