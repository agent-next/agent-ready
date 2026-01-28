/**
 * Markdown/Terminal output formatter
 *
 * Displays scan results in a readable terminal format with i18n support
 */

import chalk from 'chalk';
import type { ScanResult, Level, ActionPriority } from '../types.js';
import { LEVELS } from '../types.js';
import { t, getPillarName, getLevelName, getPriorityName } from '../i18n/index.js';

const LEVEL_COLORS: Record<Level | 'none', (text: string) => string> = {
  L1: chalk.red,
  L2: chalk.yellow,
  L3: chalk.cyan,
  L4: chalk.blue,
  L5: chalk.green,
  none: chalk.gray,
};

const PRIORITY_COLORS: Record<ActionPriority, (text: string) => string> = {
  critical: chalk.red.bold,
  high: chalk.red,
  medium: chalk.yellow,
  low: chalk.gray,
};

/**
 * Output scan results to terminal
 */
export function outputMarkdown(result: ScanResult, verbose: boolean): void {
  console.log('');

  // Header
  printHeader(result);

  // Level badge
  printLevelBadge(result);

  // Pillar summary
  printPillarSummary(result);

  // Level breakdown
  if (verbose) {
    printLevelBreakdown(result);
  }

  // Action items
  if (result.action_items.length > 0) {
    printActionItems(result, verbose);
  }

  // Monorepo apps
  if (result.is_monorepo && result.apps && result.apps.length > 0) {
    printMonorepoApps(result);
  }

  console.log('');
}

function printHeader(result: ScanResult): void {
  console.log(chalk.bold(t('output.title')));
  console.log(chalk.dim('─'.repeat(50)));
  console.log(`${chalk.dim(t('output.repository'))} ${result.repo}`);
  console.log(`${chalk.dim(t('output.commit'))}     ${result.commit}`);
  console.log(
    `${chalk.dim(t('output.profileLabel'))}    ${result.profile} v${result.profile_version}`
  );
  console.log(
    `${chalk.dim(t('output.time'))}       ${new Date(result.timestamp).toLocaleString()}`
  );

  // Show project type info
  const projectType = result.project_type;
  const typeColor =
    projectType.confidence === 'high'
      ? chalk.green
      : projectType.confidence === 'medium'
        ? chalk.yellow
        : chalk.gray;
  console.log(
    `${chalk.dim('Project Type:')} ${typeColor(projectType.type)} ${chalk.dim(`(${projectType.confidence} confidence)`)}`
  );

  // Show skipped checks if any
  if (result.checks_skipped_by_type > 0) {
    console.log(
      chalk.dim(
        `Skipped ${result.checks_skipped_by_type} checks not applicable to ${projectType.type} projects`
      )
    );
  }

  console.log('');
}

function printLevelBadge(result: ScanResult): void {
  const level = result.level || 'none';
  const colorFn = LEVEL_COLORS[level];
  const levelName = result.level ? getLevelName(result.level) : t('output.notAchieved');

  const badge = `┌─────────────────────────────────────────────────┐
│                                                 │
│          ${colorFn(t('output.level', { level: levelName }))}                          │
│          ${chalk.dim(t('output.score', { score: result.overall_score }))}                            │
│                                                 │
└─────────────────────────────────────────────────┘`;

  console.log(badge);
  console.log('');

  if (result.level && result.progress_to_next < 1) {
    const nextLevel = getNextLevel(result.level);
    if (nextLevel) {
      const progress = Math.round(result.progress_to_next * 100);
      const bar = createProgressBar(progress);
      console.log(`${t('output.progressTo', { level: nextLevel })} ${bar} ${progress}%`);
      console.log('');
    }
  }
}

function printPillarSummary(result: ScanResult): void {
  console.log(chalk.bold(t('output.pillarSummary')));
  console.log(chalk.dim('─'.repeat(50)));

  const pillars = Object.values(result.pillars).filter((p) => p.checks_total > 0);

  for (const pillar of pillars) {
    const levelStr = pillar.level_achieved || '-';
    const colorFn = pillar.level_achieved ? LEVEL_COLORS[pillar.level_achieved] : chalk.gray;

    const score = pillar.score;
    const scoreColor = score >= 80 ? chalk.green : score >= 50 ? chalk.yellow : chalk.red;

    const checkStatus = `${pillar.checks_passed}/${pillar.checks_total}`;
    const pillarName = getPillarName(pillar.pillar);

    console.log(
      `  ${pillarName.padEnd(16)} ${colorFn(levelStr.padEnd(4))} ${scoreColor(
        score.toString().padStart(3)
      )}% ${chalk.dim(`(${checkStatus})`)}`
    );
  }

  console.log('');
}

function printLevelBreakdown(result: ScanResult): void {
  console.log(chalk.bold(t('output.levelBreakdown')));
  console.log(chalk.dim('─'.repeat(50)));

  const levels = LEVELS;

  for (const level of levels) {
    const summary = result.levels[level];
    if (summary.checks_total === 0) continue;

    const status = summary.achieved ? chalk.green('✓') : chalk.red('✗');
    const colorFn = LEVEL_COLORS[level];

    console.log(
      `  ${status} ${colorFn(level)} - ${summary.score}% ` +
        `(${t('output.checks', { passed: summary.checks_passed, total: summary.checks_total })}, ` +
        `${t('output.required', { passed: summary.required_passed, total: summary.required_total })})`
    );
  }

  console.log('');
}

function printActionItems(result: ScanResult, verbose: boolean): void {
  console.log(chalk.bold(t('output.actionItems')));
  console.log(chalk.dim('─'.repeat(50)));

  const itemsToShow = verbose ? result.action_items : result.action_items.slice(0, 5);

  for (const item of itemsToShow) {
    const priorityColor = PRIORITY_COLORS[item.priority];
    const priorityBadge = priorityColor(`[${getPriorityName(item.priority)}]`);
    const levelColor = LEVEL_COLORS[item.level];

    console.log(`  ${priorityBadge} ${levelColor(item.level)} ${item.action}`);
  }

  if (!verbose && result.action_items.length > 5) {
    console.log(chalk.dim(`  ${t('output.andMore', { count: result.action_items.length - 5 })}`));
  }

  console.log('');
}

function printMonorepoApps(result: ScanResult): void {
  if (!result.apps) return;

  console.log(chalk.bold(t('output.monorepoApps')));
  console.log(chalk.dim('─'.repeat(50)));

  for (const app of result.apps) {
    if (app.error) {
      // Show error for failed apps
      console.log(
        `  ${app.name.padEnd(20)} ${chalk.red(t('output.errorLabel'))} ${chalk.dim(app.error)}`
      );
    } else {
      const level = app.level || '-';
      const colorFn = app.level ? LEVEL_COLORS[app.level] : chalk.gray;

      console.log(
        `  ${app.name.padEnd(20)} ${colorFn(level.padEnd(4))} ${app.score}% ` +
          chalk.dim(`(${app.checks_passed}/${app.checks_total})`)
      );
    }
  }

  console.log('');
}

function getNextLevel(current: Level): Level | null {
  const levels = LEVELS;
  const index = levels.indexOf(current);
  return index < levels.length - 1 ? levels[index + 1] : null;
}

function createProgressBar(percent: number): string {
  const width = 20;
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;

  return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
}
