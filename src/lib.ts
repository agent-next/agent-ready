/**
 * agent-ready library exports
 *
 * This file exports the public API for use by other packages
 */

// Types
export type {
  Language,
  ProjectType,
  ProjectTypeInfo,
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
  ScanContext,
  PackageJson,
  InitOptions,
  CheckExecutor,
} from './types.js';

// Check executors
export { executeCheck, executeChecks, getSupportedCheckTypes } from './checks/index.js';

// Engine
export { buildScanContext } from './engine/index.js';

// Templates
export type { Template } from './templates/index.js';
export { getTemplates, getTemplateForCheck, listTemplates } from './templates/index.js';

// Checker
export type { AreaStatus, ReadinessResult } from './checker.js';
export { checkRepoReadiness } from './checker.js';

// i18n
export type { Locale, Translations } from './i18n/index.js';
export {
  t,
  setLocale,
  getLocale,
  getAvailableLocales,
  isValidLocale,
  LOCALES,
} from './i18n/index.js';
