/**
 * Safe execution utilities using execFileSync to prevent shell injection
 */

import { execFileSync, type ExecFileSyncOptions } from 'node:child_process';

export interface ExecResult {
  stdout: string;
  success: boolean;
}

/**
 * Safely execute a command without shell interpolation
 */
export function execSafe(
  command: string,
  args: string[],
  options?: ExecFileSyncOptions
): ExecResult {
  try {
    const stdout = execFileSync(command, args, {
      ...options,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }) as string;
    return { stdout: stdout.trim(), success: true };
  } catch {
    return { stdout: '', success: false };
  }
}

/**
 * Execute git command safely
 */
export function gitExec(args: string[], repoPath: string): ExecResult {
  return execSafe('git', args, { cwd: repoPath });
}
