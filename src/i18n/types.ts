/**
 * i18n type definitions
 */

import type { Level, Pillar, ActionPriority } from '../types.js';

export type Locale = 'en' | 'zh';

export const LOCALES: Locale[] = ['en', 'zh'];

export interface Translations {
  // Pillar names
  pillars: Record<Pillar, string>;

  // Level names
  levels: Record<Level | 'none', string>;

  // Priority names
  priorities: Record<ActionPriority, string>;

  // CLI messages
  cli: {
    scanning: string;
    profile: string;
    error: string;
    pathNotFound: string;
    invalidLevel: string;
    validLevels: string;
    invalidOutput: string;
    validOutputs: string;
    scanFailed: string;
    jsonOutput: string;
  };

  // Output messages
  output: {
    title: string;
    repository: string;
    commit: string;
    profileLabel: string;
    time: string;
    level: string;
    score: string;
    notAchieved: string;
    progressTo: string;
    pillarSummary: string;
    levelBreakdown: string;
    actionItems: string;
    monorepoApps: string;
    andMore: string;
    checks: string;
    required: string;
    errorLabel: string;
  };

  // Check-related messages
  checks: {
    fileNotFound: string;
    fileExists: string;
    patternMatched: string;
    noMatches: string;
    workflowEventFound: string;
    workflowEventNotFound: string;
    actionFound: string;
    actionNotFound: string;
    buildCommandFound: string;
    noBuildCommand: string;
    logFrameworkFound: string;
    noLogFramework: string;
    dependencyFound: string;
    noDependency: string;
    anyOfPassed: string;
    anyOfFailed: string;
  };

  // Init command messages
  init: {
    dryRunHeader: string;
    wouldCreate: string;
    creatingFile: string;
    fileCreated: string;
    fileSkipped: string;
    fileOverwritten: string;
    noTemplates: string;
    initComplete: string;
    filesCreated: string;
    filesSkipped: string;
  };
}

export interface TranslationModule {
  default: Translations;
}
