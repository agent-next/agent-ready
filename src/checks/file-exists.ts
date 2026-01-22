/**
 * file_exists check implementation
 *
 * Checks if a file exists and optionally matches a content regex
 */

import * as path from 'node:path';
import type { FileExistsCheck, CheckResult, ScanContext } from '../types.js';
import { fileExists as fileExistsUtil, readFileCached } from '../utils/fs.js';
import { safeRegexTest } from '../utils/regex.js';

export async function executeFileExists(
  check: FileExistsCheck,
  context: ScanContext
): Promise<CheckResult> {
  const filePath = path.join(context.root_path, check.path);

  // Check if file exists
  const exists = await fileExistsUtil(filePath);

  if (!exists) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: false,
      required: check.required,
      message: `File not found: ${check.path}`,
      suggestions: [`Create ${check.path}`],
    };
  }

  // If no content regex, file existence is enough
  if (!check.content_regex) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: true,
      required: check.required,
      message: `File exists: ${check.path}`,
      matched_files: [check.path],
    };
  }

  // Check content against regex
  const content = await readFileCached(filePath, context.file_cache);

  if (!content) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: false,
      required: check.required,
      message: `File exists but could not be read: ${check.path}`,
    };
  }

  const flags = check.case_sensitive === false ? 'i' : '';
  const result = safeRegexTest(check.content_regex, content, flags);

  if (result.error) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: false,
      required: check.required,
      message: `Invalid regex pattern for ${check.path}: ${result.error}`,
      details: { pattern: check.content_regex, error: result.error },
    };
  }

  if (result.matched) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: true,
      required: check.required,
      message: `File exists and contains required pattern: ${check.path}`,
      matched_files: [check.path],
    };
  }

  return {
    check_id: check.id,
    check_name: check.name,
    pillar: check.pillar,
    level: check.level,
    passed: false,
    required: check.required,
    message: `File exists but does not contain required pattern: ${check.path}`,
    suggestions: [`Update ${check.path} to include required content`],
    details: { pattern: check.content_regex },
  };
}
