/**
 * YAML utilities for profile loading
 */

import * as yaml from 'js-yaml';
import { readFile } from './fs.js';
import type { Profile, CheckConfig, Pillar, Level, ProjectType } from '../types.js';
import { PILLARS, LEVELS } from '../types.js';

/**
 * Parse YAML content to Profile
 * Uses JSON_SCHEMA for security - prevents arbitrary code execution
 */
export function parseProfile(content: string): Profile {
  const parsed = yaml.load(content, { schema: yaml.JSON_SCHEMA }) as RawProfile;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid profile: empty or not an object');
  }

  if (!parsed.name) {
    throw new Error('Invalid profile: missing name');
  }

  if (!Array.isArray(parsed.checks)) {
    throw new Error('Invalid profile: checks must be an array');
  }

  return {
    name: parsed.name,
    version: parsed.version || '1.0.0',
    description: parsed.description || '',
    checks: parsed.checks.map(validateCheck),
  };
}

/**
 * Load profile from file
 */
export async function loadProfile(filePath: string): Promise<Profile> {
  const content = await readFile(filePath);

  if (!content) {
    throw new Error(`Profile not found: ${filePath}`);
  }

  return parseProfile(content);
}

// Raw profile type for parsing
interface RawProfile {
  name?: string;
  version?: string;
  description?: string;
  checks?: RawCheck[];
}

interface RawCheck {
  id?: string;
  name?: string;
  description?: string;
  type?: string;
  pillar?: string;
  level?: string;
  required?: boolean;
  weight?: number;
  tags?: string[];
  applicableTo?: ProjectType[];
  [key: string]: unknown;
}

/**
 * Validate and transform a raw check to CheckConfig
 */
function validateCheck(raw: RawCheck, index: number): CheckConfig {
  if (!raw.id) {
    throw new Error(`Check at index ${index} missing 'id'`);
  }
  if (!raw.type) {
    throw new Error(`Check '${raw.id}' missing 'type'`);
  }
  if (!raw.pillar) {
    throw new Error(`Check '${raw.id}' missing 'pillar'`);
  }
  if (!raw.level) {
    throw new Error(`Check '${raw.id}' missing 'level'`);
  }

  // Validate pillar is a known value
  if (!PILLARS.includes(raw.pillar as Pillar)) {
    throw new Error(
      `Check '${raw.id}' has invalid pillar '${raw.pillar}'. Valid pillars: ${PILLARS.join(', ')}`
    );
  }

  // Validate level is a known value
  if (!LEVELS.includes(raw.level as Level)) {
    throw new Error(
      `Check '${raw.id}' has invalid level '${raw.level}'. Valid levels: ${LEVELS.join(', ')}`
    );
  }

  // Validate applicableTo if provided
  if (
    raw.applicableTo &&
    (!Array.isArray(raw.applicableTo) || !raw.applicableTo.every((t) => typeof t === 'string'))
  ) {
    throw new Error(`Check '${raw.id}' 'applicableTo' must be an array of strings`);
  }

  const base = {
    id: raw.id,
    name: raw.name || raw.id,
    description: raw.description || '',
    pillar: raw.pillar as Pillar,
    level: raw.level as Level,
    required: raw.required ?? false,
    weight: raw.weight ?? 1.0,
    tags: raw.tags ?? [],
    applicableTo: raw.applicableTo,
  };

  switch (raw.type) {
    case 'file_exists':
      if (typeof raw.path !== 'string') {
        throw new Error(`Check '${raw.id}' of type 'file_exists' missing required 'path' field`);
      }
      return {
        ...base,
        type: 'file_exists',
        path: raw.path,
        content_regex: raw.content_regex as string | undefined,
        case_sensitive: raw.case_sensitive as boolean | undefined,
      };

    case 'path_glob':
      if (typeof raw.pattern !== 'string') {
        throw new Error(`Check '${raw.id}' of type 'path_glob' missing required 'pattern' field`);
      }
      return {
        ...base,
        type: 'path_glob',
        pattern: raw.pattern,
        min_matches: raw.min_matches as number | undefined,
        max_matches: raw.max_matches as number | undefined,
        content_regex: raw.content_regex as string | undefined,
      };

    case 'any_of':
      if (!Array.isArray(raw.checks)) {
        throw new Error(`Check '${raw.id}' of type 'any_of' missing required 'checks' array`);
      }
      return {
        ...base,
        type: 'any_of',
        checks: raw.checks.map((c, i) => validateCheck(c as RawCheck, i)),
        min_pass: raw.min_pass as number | undefined,
      };

    case 'github_workflow_event':
      if (typeof raw.event !== 'string') {
        throw new Error(
          `Check '${raw.id}' of type 'github_workflow_event' missing required 'event' field`
        );
      }
      return {
        ...base,
        type: 'github_workflow_event',
        event: raw.event,
        branches: raw.branches as string[] | undefined,
      };

    case 'github_action_present':
      if (typeof raw.action !== 'string') {
        throw new Error(
          `Check '${raw.id}' of type 'github_action_present' missing required 'action' field`
        );
      }
      return {
        ...base,
        type: 'github_action_present',
        action: raw.action,
        action_pattern: raw.action_pattern as string | undefined,
      };

    case 'build_command_detect':
      if (!Array.isArray(raw.commands)) {
        throw new Error(
          `Check '${raw.id}' of type 'build_command_detect' missing required 'commands' array`
        );
      }
      return {
        ...base,
        type: 'build_command_detect',
        commands: raw.commands as string[],
        files: raw.files as string[] | undefined,
      };

    case 'log_framework_detect':
      if (!Array.isArray(raw.frameworks)) {
        throw new Error(
          `Check '${raw.id}' of type 'log_framework_detect' missing required 'frameworks' array`
        );
      }
      if (!raw.frameworks.every((f) => typeof f === 'string')) {
        throw new Error(`Check '${raw.id}' 'frameworks' array must contain only strings`);
      }
      return {
        ...base,
        type: 'log_framework_detect',
        frameworks: raw.frameworks as string[],
      };

    case 'dependency_detect':
      if (!Array.isArray(raw.packages)) {
        throw new Error(
          `Check '${raw.id}' of type 'dependency_detect' missing required 'packages' array`
        );
      }
      if (!raw.packages.every((p) => typeof p === 'string')) {
        throw new Error(`Check '${raw.id}' 'packages' array must contain only strings`);
      }
      if (
        raw.config_files &&
        Array.isArray(raw.config_files) &&
        !raw.config_files.every((f) => typeof f === 'string')
      ) {
        throw new Error(`Check '${raw.id}' 'config_files' array must contain only strings`);
      }
      return {
        ...base,
        type: 'dependency_detect',
        packages: raw.packages as string[],
        config_files: raw.config_files as string[] | undefined,
      };

    case 'git_freshness':
      if (typeof raw.path !== 'string') {
        throw new Error(`Check '${raw.id}' of type 'git_freshness' missing required 'path' string`);
      }
      if (typeof raw.max_days !== 'number') {
        throw new Error(
          `Check '${raw.id}' of type 'git_freshness' missing required 'max_days' number`
        );
      }
      return {
        ...base,
        type: 'git_freshness',
        path: raw.path as string,
        max_days: raw.max_days as number,
      };

    case 'command_exists':
      if (!Array.isArray(raw.commands)) {
        throw new Error(
          `Check '${raw.id}' of type 'command_exists' missing required 'commands' array`
        );
      }
      if (!raw.commands.every((c) => typeof c === 'string')) {
        throw new Error(`Check '${raw.id}' 'commands' array must contain only strings`);
      }
      return {
        ...base,
        type: 'command_exists',
        commands: raw.commands as string[],
        require_all: raw.require_all as boolean | undefined,
      };

    default:
      throw new Error(`Check '${raw.id}' has unknown type '${raw.type}'`);
  }
}

/**
 * Serialize Profile to YAML
 */
export function serializeProfile(profile: Profile): string {
  return yaml.dump(profile, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });
}
