/**
 * any_of composite check implementation
 *
 * Passes if at least min_pass (default 1) of the nested checks pass
 */

import type { AnyOfCheck, CheckResult, ScanContext } from '../types.js';
import { executeCheck } from './index.js';

export async function executeAnyOf(check: AnyOfCheck, context: ScanContext): Promise<CheckResult> {
  const minPass = check.min_pass ?? 1;
  const results: CheckResult[] = [];
  const passedChecks: string[] = [];

  // Execute all nested checks
  for (const nestedCheck of check.checks) {
    const result = await executeCheck(nestedCheck, context);
    results.push(result);
    if (result.passed) {
      passedChecks.push(nestedCheck.id);
    }
  }

  const passedCount = passedChecks.length;
  const totalCount = check.checks.length;

  if (passedCount >= minPass) {
    // Collect all matched files from passed checks
    const matchedFiles = results
      .filter((r) => r.passed && r.matched_files)
      .flatMap((r) => r.matched_files!);

    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: true,
      required: check.required,
      message: `${passedCount}/${totalCount} alternatives passed (need ${minPass})`,
      matched_files: matchedFiles.length > 0 ? matchedFiles : undefined,
      details: {
        passed_checks: passedChecks,
        min_required: minPass,
      },
    };
  }

  // Collect suggestions from failed checks
  const suggestions = results
    .filter((r) => !r.passed && r.suggestions)
    .flatMap((r) => r.suggestions!);

  return {
    check_id: check.id,
    check_name: check.name,
    pillar: check.pillar,
    level: check.level,
    passed: false,
    required: check.required,
    message: `Only ${passedCount}/${totalCount} alternatives passed (need ${minPass})`,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    details: {
      passed_checks: passedChecks,
      failed_checks: check.checks.filter((c) => !passedChecks.includes(c.id)).map((c) => c.id),
      min_required: minPass,
    },
  };
}
