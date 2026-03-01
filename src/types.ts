/**
 * Core type definitions for agent-ready
 */

// Project types for intelligent check filtering
export type ProjectType = 'cli' | 'web-service' | 'library' | 'webapp' | 'monorepo' | 'unknown';

// Project type detection result
export interface ProjectTypeInfo {
  type: ProjectType;
  confidence: 'high' | 'medium' | 'low';
  indicators: string[];
}

// Language detection
export type Language = 'typescript' | 'javascript' | 'python' | 'unknown';

// Check type discriminators
export type CheckType =
  | 'file_exists'
  | 'path_glob'
  | 'any_of'
  | 'github_workflow_event'
  | 'github_action_present'
  | 'build_command_detect'
  | 'log_framework_detect'
  | 'dependency_detect'
  | 'git_freshness'
  | 'command_exists';

// Base check configuration
export interface BaseCheckConfig {
  id: string;
  name: string;
  description: string;
  pillar: string;
  level: string;
  required: boolean;
  weight?: number;
  tags?: string[];
  applicableTo?: ProjectType[];
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
  min_matches?: number;
  max_matches?: number;
  content_regex?: string;
}

// any_of composite check
export interface AnyOfCheck extends BaseCheckConfig {
  type: 'any_of';
  checks: CheckConfig[];
  min_pass?: number;
}

// github_workflow_event check
export interface GitHubWorkflowEventCheck extends BaseCheckConfig {
  type: 'github_workflow_event';
  event: string;
  branches?: string[];
}

// github_action_present check
export interface GitHubActionPresentCheck extends BaseCheckConfig {
  type: 'github_action_present';
  action: string;
  action_pattern?: string;
}

// build_command_detect check
export interface BuildCommandDetectCheck extends BaseCheckConfig {
  type: 'build_command_detect';
  commands: string[];
  files?: string[];
}

// log_framework_detect check
export interface LogFrameworkDetectCheck extends BaseCheckConfig {
  type: 'log_framework_detect';
  frameworks: string[];
}

// dependency_detect check
export interface DependencyDetectCheck extends BaseCheckConfig {
  type: 'dependency_detect';
  packages: string[];
  config_files?: string[];
}

// git_freshness check
export interface GitFreshnessCheck extends BaseCheckConfig {
  type: 'git_freshness';
  path: string;
  max_days: number;
}

// command_exists check
export interface CommandExistsCheck extends BaseCheckConfig {
  type: 'command_exists';
  commands: string[];
  require_all?: boolean;
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
  | DependencyDetectCheck
  | GitFreshnessCheck
  | CommandExistsCheck;

// Check result
export interface CheckResult {
  check_id: string;
  check_name: string;
  pillar: string;
  level: string;
  passed: boolean;
  required: boolean;
  message: string;
  details?: Record<string, unknown>;
  matched_files?: string[];
  suggestions?: string[];
}

// Scan context (passed to checks)
export interface ScanContext {
  root_path: string;
  repo_name: string;
  commit_sha: string;
  file_cache: Map<string, string>;
  glob_cache: Map<string, string[]>;
  package_json?: PackageJson;
  is_monorepo: boolean;
  monorepo_apps: string[];
  project_type: ProjectTypeInfo;
  language: Language;
}

// Simplified package.json type
export interface PackageJson {
  name?: string;
  version?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  workspaces?: string[] | { packages: string[] };
  bin?: string | Record<string, string>;
  main?: string;
  module?: string;
  exports?: unknown;
  types?: string;
  typings?: string;
  publishConfig?: Record<string, unknown>;
  files?: string[];
}

// CLI options
export interface InitOptions {
  path: string;
  check?: string;
  dryRun: boolean;
  force: boolean;
}

// Check executor interface
export interface CheckExecutor {
  type: CheckType;
  execute(check: CheckConfig, context: ScanContext): Promise<CheckResult>;
}
