/**
 * agent-ready library exports
 *
 * This file exports the public API for use by other packages (like agent-ready-backend)
 */

// Types
export type {
  Level,
  Pillar,
  CheckType,
  BaseCheckConfig,
  FileExistsCheck,
  PathGlobCheck,
  AnyOfCheck,
  GitHubWorkflowEventCheck,
  GitHubActionPresentCheck,
  BuildCommandDetectCheck,
  LogFrameworkDetectCheck,
  DependencyDetectCheck,
  CheckConfig,
  CheckResult,
  Profile,
  PillarSummary,
  LevelSummary,
  ActionPriority,
  ActionItem,
  MonorepoApp,
  ScanResult,
  ScanContext,
  PackageJson,
  ScanOptions,
  InitOptions,
  CheckExecutor,
} from './types.js';

// Type constants
export { LEVELS, LEVEL_NAMES, PILLARS, PILLAR_NAMES, PASSING_THRESHOLD } from './types.js';

// Check executors
export { executeCheck, executeChecks, getSupportedCheckTypes } from './checks/index.js';

// Profile loading
export { loadProfile, loadDefaultProfile, listProfiles } from './profiles/index.js';

// Engine
export {
  buildScanContext,
  calculateLevelSummaries,
  determineAchievedLevel,
  calculateProgressToNext,
  calculatePillarSummaries,
  calculateOverallScore,
} from './engine/index.js';

// Scanner
export { scan } from './scanner.js';

// Output formatters
export { formatJson, outputJson } from './output/json.js';
export { outputMarkdown } from './output/markdown.js';

// Templates
export type { Template } from './templates/index.js';
export { getTemplates, getTemplateForCheck, listTemplates } from './templates/index.js';

// i18n
export type { Locale, Translations } from './i18n/index.js';
export {
  t,
  setLocale,
  getLocale,
  getAvailableLocales,
  isValidLocale,
  getPillarName,
  getLevelName,
  getPriorityName,
  LOCALES,
} from './i18n/index.js';
