/**
 * get_baseline_scan tool - Quick file-existence scan using CLI
 *
 * This tool runs the agent-ready CLI for a quick baseline.
 * It only checks file existence, not quality.
 * Use get_repo_context + get_analysis_framework for deep analysis.
 */

import { z } from 'zod';
import { scan, setLocale, isValidLocale, type Level, type Locale } from 'agent-ready';

export const getBaselineScanSchema = z.object({
  path: z.string().describe('Path to the repository to scan'),
  profile: z.string().optional().default('factory_compat').describe('Profile to use'),
  level: z.enum(['L1', 'L2', 'L3', 'L4', 'L5']).optional().describe('Target level to check'),
  lang: z.enum(['en', 'zh']).optional().default('en').describe('Output language'),
});

export type GetBaselineScanInput = z.infer<typeof getBaselineScanSchema>;

export async function getBaselineScan(input: GetBaselineScanInput): Promise<string> {
  const { path, profile, level, lang } = input;

  if (lang && isValidLocale(lang)) {
    setLocale(lang as Locale);
  }

  const result = await scan({
    path,
    profile: profile || 'factory_compat',
    output: 'json',
    level: level as Level | undefined,
    verbose: false,
  });

  return JSON.stringify(
    {
      note: 'This is a file-existence baseline. For quality analysis, use Read/Glob tools.',
      repository: result.repo,
      commit: result.commit,
      timestamp: result.timestamp,
      profile: result.profile,
      level: result.level,
      overall_score: result.overall_score,
      progress_to_next: result.progress_to_next,
      is_monorepo: result.is_monorepo,
      pillars: Object.entries(result.pillars).map(([key, value]) => ({
        name: value.name,
        pillar: key,
        level_achieved: value.level_achieved,
        score: value.score,
        checks_passed: value.checks_passed,
        checks_total: value.checks_total,
      })),
      levels: Object.entries(result.levels).map(([key, value]) => ({
        level: key,
        achieved: value.achieved,
        score: value.score,
        checks_passed: value.checks_passed,
        checks_total: value.checks_total,
      })),
      failed_checks_count: result.failed_checks.length,
      action_items_count: result.action_items.length,
    },
    null,
    2
  );
}
