/**
 * Core type definitions for agent-readiness scanner
 */

// Level definitions (Factory-compatible)
export type Level = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

export const LEVELS: Level[] = ['L1', 'L2', 'L3', 'L4', 'L5'];

// Factory.ai official level names
export const LEVEL_NAMES: Record<Level, string> = {
  L1: 'Functional',
  L2: 'Documented',
  L3: 'Standardized',
  L4: 'Optimized',
  L5: 'Autonomous',
};

// Pillar definitions (Factory-compatible 9 Pillars)
// Note: CI/CD merged into Build System per Factory spec
export type Pillar =
  | 'docs'
  | 'style'
  | 'build' // Includes CI/CD checks
  | 'test'
  | 'security'
  | 'observability'
  | 'env'
  | 'task_discovery'
  | 'product'; // Feature flags, analytics, A/B testing

export const PILLARS: Pillar[] = [
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

export const PILLAR_NAMES: Record<Pillar, string> = {
  docs: 'Documentation',
  style: 'Code Style',
  build: 'Build System & CI/CD',
  test: 'Testing',
  security: 'Security',
  observability: 'Observability',
  env: 'Environment',
  task_discovery: 'Task Discovery',
  product: 'Product & Experimentation',
};

// Check type discriminators
export type CheckType =
  | 'file_exists'
  | 'path_glob'
  | 'any_of'
  | 'github_workflow_event'
  | 'github_action_present'
  | 'build_command_detect'
  | 'log_framework_detect'
  | 'dependency_detect';

// Base check configuration
export interface BaseCheckConfig {
  id: string;
  name: string;
  description: string;
  pillar: Pillar;
  level: Level;
  required: boolean;
  weight?: number; // Default 1.0
  tags?: string[];
}

// file_exists check
export interface FileExistsCheck extends BaseCheckConfig {
  type: 'file_exists';
  path: string;
  content_regex?: string;
  case_sensitive?: boolean;
}

// path_glob check
export interface PathGlobCheck extends BaseCheckConfig {
  type: 'path_glob';
  pattern: string;
  min_matches?: number; // Default 1
  max_matches?: number;
  content_regex?: string;
}

// any_of composite check
export interface AnyOfCheck extends BaseCheckConfig {
  type: 'any_of';
  checks: CheckConfig[];
  min_pass?: number; // Default 1
}

// github_workflow_event check
export interface GitHubWorkflowEventCheck extends BaseCheckConfig {
  type: 'github_workflow_event';
  event: string; // 'push', 'pull_request', etc.
  branches?: string[];
}

// github_action_present check
export interface GitHubActionPresentCheck extends BaseCheckConfig {
  type: 'github_action_present';
  action: string; // e.g., 'actions/checkout@v4'
  action_pattern?: string; // Regex for flexible matching
}

// build_command_detect check
export interface BuildCommandDetectCheck extends BaseCheckConfig {
  type: 'build_command_detect';
  commands: string[]; // Commands to look for
  files?: string[]; // Files to search in (package.json, Makefile, etc.)
}

// log_framework_detect check
export interface LogFrameworkDetectCheck extends BaseCheckConfig {
  type: 'log_framework_detect';
  frameworks: string[]; // e.g., ['winston', 'pino', 'bunyan']
}

// dependency_detect check (for tracing, metrics, analytics packages)
export interface DependencyDetectCheck extends BaseCheckConfig {
  type: 'dependency_detect';
  packages: string[]; // NPM/pip/cargo packages to detect
  config_files?: string[]; // Config files that indicate usage (e.g., 'otel.config.js')
}

// Union type for all checks
export type CheckConfig =
  | FileExistsCheck
  | PathGlobCheck
  | AnyOfCheck
  | GitHubWorkflowEventCheck
  | GitHubActionPresentCheck
  | BuildCommandDetectCheck
  | LogFrameworkDetectCheck
  | DependencyDetectCheck;

// Check result
export interface CheckResult {
  check_id: string;
  check_name: string;
  pillar: Pillar;
  level: Level;
  passed: boolean;
  required: boolean;
  message: string;
  details?: Record<string, unknown>;
  matched_files?: string[];
  suggestions?: string[];
}

// Profile definition
export interface Profile {
  name: string;
  version: string;
  description: string;
  checks: CheckConfig[];
}

// Pillar summary in results
export interface PillarSummary {
  pillar: Pillar;
  name: string;
  level_achieved: Level | null;
  score: number; // 0-100
  checks_passed: number;
  checks_total: number;
  failed_checks: string[];
}

// Level summary
export interface LevelSummary {
  level: Level;
  achieved: boolean;
  score: number; // 0-100
  checks_passed: number;
  checks_total: number;
  required_passed: number;
  required_total: number;
}

// Action item for recommendations
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';

export interface ActionItem {
  priority: ActionPriority;
  check_id: string;
  pillar: Pillar;
  level: Level;
  action: string;
  details?: string;
  template?: string; // Template file to generate
}

// Monorepo app definition
export interface MonorepoApp {
  name: string;
  path: string;
  level: Level | null;
  score: number;
  checks_passed: number;
  checks_total: number;
  error?: string; // Error message if scan failed
}

// Main scan result
export interface ScanResult {
  repo: string;
  commit: string;
  timestamp: string;
  profile: string;
  profile_version: string;
  level: Level | null;
  progress_to_next: number; // 0.0 - 1.0
  overall_score: number; // 0-100
  pillars: Record<Pillar, PillarSummary>;
  levels: Record<Level, LevelSummary>;
  check_results: CheckResult[];
  failed_checks: CheckResult[];
  action_items: ActionItem[];
  is_monorepo: boolean;
  apps?: MonorepoApp[];
}

// Scan context (passed to checks)
export interface ScanContext {
  root_path: string;
  repo_name: string;
  commit_sha: string;
  file_cache: Map<string, string>; // path -> content
  glob_cache: Map<string, string[]>; // pattern -> matches
  package_json?: PackageJson;
  is_monorepo: boolean;
  monorepo_apps: string[];
}

// Simplified package.json type
export interface PackageJson {
  name?: string;
  version?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  workspaces?: string[] | { packages: string[] };
}

// CLI options
export interface ScanOptions {
  path: string;
  profile: string;
  output: 'json' | 'markdown' | 'both';
  level?: Level;
  verbose: boolean;
  outputFile?: string;
}

export interface InitOptions {
  path: string;
  level?: Level;
  check?: string;
  dryRun: boolean;
  force: boolean;
  interactive: boolean;
}

// Check executor interface
export interface CheckExecutor {
  type: CheckType;
  execute(check: CheckConfig, context: ScanContext): Promise<CheckResult>;
}

// Level gating constants
export const PASSING_THRESHOLD = 0.8; // 80% of checks must pass
