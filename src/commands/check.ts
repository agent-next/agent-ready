/**
 * CLI check command
 *
 * Checks repo readiness for AI agents across 9 areas.
 */

import { checkRepoReadiness } from '../checker.js';

export async function checkCommand(
  targetPath: string,
  options: { json?: boolean; strict?: boolean }
): Promise<void> {
  let result;
  try {
    result = await checkRepoReadiness(targetPath);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (options.json) {
      console.log(JSON.stringify({ ok: false, error: msg }));
    } else {
      console.error(`Error: ${msg}`);
    }
    process.exit(1);
  }

  const allComplete = Object.values(result.data.areas).every(
    (a) => a.status === 'complete' || a.status === 'unknown'
  );

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    if (!allComplete && options.strict) process.exit(1);
    return;
  }

  // Human-readable output
  const { data } = result;
  console.log(`\nProject: ${data.project_type} (${data.language})\n`);

  for (const [area, info] of Object.entries(data.areas)) {
    const icon =
      info.status === 'complete'
        ? '\u2713'
        : info.status === 'partial'
          ? '\u25B3'
          : info.status === 'unknown'
            ? '?'
            : '\u2717';
    console.log(`  ${icon} ${area}: ${info.status}`);
    if (info.missing?.length) {
      for (const m of info.missing) {
        console.log(`      missing: ${m}`);
      }
    }
    if (info.note) {
      console.log(`      note: ${info.note}`);
    }
  }

  if (!allComplete && options.strict) {
    process.exit(1);
  }
}
