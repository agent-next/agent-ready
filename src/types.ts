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
