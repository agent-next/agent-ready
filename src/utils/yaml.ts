/**
 * YAML utilities
 */

import * as yaml from 'js-yaml';
import { readFile } from './fs.js';

/**
 * Parse YAML content safely using JSON_SCHEMA
 */
export function parseYaml<T = unknown>(content: string): T {
  return yaml.load(content, { schema: yaml.JSON_SCHEMA }) as T;
}

/**
 * Load and parse a YAML file
 */
export async function loadYaml<T = unknown>(filePath: string): Promise<T> {
  const content = await readFile(filePath);

  if (!content) {
    throw new Error(`YAML file not found: ${filePath}`);
  }

  return parseYaml<T>(content);
}

/**
 * Serialize object to YAML string
 */
export function serializeYaml(data: unknown): string {
  return yaml.dump(data, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });
}
