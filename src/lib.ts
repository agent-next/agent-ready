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
  ScanContext,
  PackageJson,
  InitOptions,
} from './types.js';

// Engine
export { buildScanContext } from './engine/index.js';

// Templates
export type { Template } from './templates/index.js';
export { getTemplates, getTemplateForCheck, listTemplates } from './templates/index.js';

// Checker
export type { AreaName, AreaStatus, ReadinessResult } from './checker.js';
export { checkRepoReadiness } from './checker.js';
