/**
 * path_glob check implementation
 *
 * Checks if files matching a glob pattern exist with optional content matching
 */

import type { PathGlobCheck, CheckResult, ScanContext } from '../types.js';
import { findFilesCached, readFileCached, relativePath } from '../utils/fs.js';
import { safeRegexTest, isUnsafeRegex } from '../utils/regex.js';

export async function executePathGlob(
  check: PathGlobCheck,
  context: ScanContext
): Promise<CheckResult> {
  const minMatches = check.min_matches ?? 1;

  // Find files matching pattern
  const matches = await findFilesCached(check.pattern, context.root_path, context.glob_cache);

  if (matches.length < minMatches) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: false,
      required: check.required,
      message: `Found ${matches.length} files matching '${check.pattern}', need at least ${minMatches}`,
      suggestions: [`Create files matching pattern: ${check.pattern}`],
      details: { pattern: check.pattern, found: matches.length, required: minMatches },
    };
  }

  // Check max_matches if specified
  if (check.max_matches !== undefined && matches.length > check.max_matches) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: false,
      required: check.required,
      message: `Found ${matches.length} files matching '${check.pattern}', maximum is ${check.max_matches}`,
      details: { pattern: check.pattern, found: matches.length, max: check.max_matches },
    };
  }

  // If no content regex, file matches are enough
  if (!check.content_regex) {
    const relativeMatches = matches.map((m) => relativePath(m, context.root_path));
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: true,
      required: check.required,
      message: `Found ${matches.length} files matching '${check.pattern}'`,
      matched_files: relativeMatches,
    };
  }

  // Validate regex pattern first
  if (isUnsafeRegex(check.content_regex)) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: false,
      required: check.required,
      message: `Unsafe regex pattern detected: ${check.content_regex}`,
      details: { pattern: check.content_regex, error: 'Potentially unsafe regex pattern' },
    };
  }

  // Check content of matched files
  const matchingFiles: string[] = [];

  for (const filePath of matches) {
    const content = await readFileCached(filePath, context.file_cache);
    if (content) {
      const result = safeRegexTest(check.content_regex, content);
      if (result.matched) {
        matchingFiles.push(relativePath(filePath, context.root_path));
      }
    }
  }

  if (matchingFiles.length < minMatches) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: false,
      required: check.required,
      message: `Found ${matches.length} files matching '${check.pattern}', but only ${matchingFiles.length} contain required pattern`,
      suggestions: [`Ensure files matching ${check.pattern} contain required content`],
      details: {
        pattern: check.pattern,
        content_pattern: check.content_regex,
        files_found: matches.length,
        files_matching_content: matchingFiles.length,
      },
    };
  }

  return {
    check_id: check.id,
    check_name: check.name,
    pillar: check.pillar,
    level: check.level,
    passed: true,
    required: check.required,
    message: `Found ${matchingFiles.length} files matching '${check.pattern}' with required content`,
    matched_files: matchingFiles,
  };
}
