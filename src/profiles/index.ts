/**
 * Profile loader
 *
 * Loads check profiles from YAML files
 */

import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Profile } from '../types.js';
import { loadProfile as loadProfileYaml } from '../utils/yaml.js';
import { fileExists } from '../utils/fs.js';

// Get the directory of this module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Profiles directory (relative to compiled output)
const PROFILES_DIR = path.resolve(__dirname, '../../profiles');

// Built-in profile names
const BUILTIN_PROFILES = ['factory_compat'];

/**
 * Load a profile by name or path
 */
export async function loadProfile(nameOrPath: string): Promise<Profile> {
  // Check if it's a path to a file
  if (nameOrPath.includes('/') || nameOrPath.includes('\\')) {
    return loadProfileYaml(nameOrPath);
  }

  // Check if it's a built-in profile
  if (BUILTIN_PROFILES.includes(nameOrPath)) {
    const profilePath = path.join(PROFILES_DIR, `${nameOrPath}.yaml`);

    if (!(await fileExists(profilePath))) {
      throw new Error(`Built-in profile not found: ${nameOrPath}`);
    }

    return loadProfileYaml(profilePath);
  }

  // Try to find it as a YAML file in profiles directory
  const yamlPath = path.join(PROFILES_DIR, `${nameOrPath}.yaml`);
  if (await fileExists(yamlPath)) {
    return loadProfileYaml(yamlPath);
  }

  const ymlPath = path.join(PROFILES_DIR, `${nameOrPath}.yml`);
  if (await fileExists(ymlPath)) {
    return loadProfileYaml(ymlPath);
  }

  throw new Error(`Profile not found: ${nameOrPath}`);
}

/**
 * Load the default profile
 */
export async function loadDefaultProfile(): Promise<Profile> {
  return loadProfile('factory_compat');
}

/**
 * List available profiles
 */
export function listProfiles(): string[] {
  return [...BUILTIN_PROFILES];
}
