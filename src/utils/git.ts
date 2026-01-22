/**
 * Git utilities for repository information
 */

import * as path from 'node:path';
import { fileExists, readFile } from './fs.js';
import { gitExec } from './exec.js';

/**
 * Check if path is inside a git repository
 */
export async function isGitRepo(repoPath: string): Promise<boolean> {
  const gitDir = path.join(repoPath, '.git');
  return await fileExists(gitDir);
}

/**
 * Get current commit SHA
 */
export function getCommitSha(repoPath: string): string {
  const result = gitExec(['rev-parse', 'HEAD'], repoPath);
  return result.success ? result.stdout : 'unknown';
}

/**
 * Get short commit SHA (7 chars)
 */
export function getShortCommitSha(repoPath: string): string {
  const sha = getCommitSha(repoPath);
  return sha === 'unknown' ? sha : sha.substring(0, 7);
}

/**
 * Get repository name from git remote or folder name
 */
export function getRepoName(repoPath: string): string {
  const result = gitExec(['remote', 'get-url', 'origin'], repoPath);

  if (!result.success) {
    return path.basename(repoPath);
  }

  const url = result.stdout;

  // Handle SSH format: git@github.com:owner/repo.git
  const sshMatch = url.match(/git@[^:]+:(.+?)(?:\.git)?$/);
  if (sshMatch) {
    return sshMatch[1];
  }

  // Handle HTTPS format: https://github.com/owner/repo.git
  const httpsMatch = url.match(/https?:\/\/[^/]+\/(.+?)(?:\.git)?$/);
  if (httpsMatch) {
    return httpsMatch[1];
  }

  // Fallback to folder name
  return path.basename(repoPath);
}

/**
 * Get current branch name
 */
export function getCurrentBranch(repoPath: string): string {
  const result = gitExec(['branch', '--show-current'], repoPath);
  return result.success && result.stdout ? result.stdout : 'unknown';
}

/**
 * Check if there are uncommitted changes
 */
export function hasUncommittedChanges(repoPath: string): boolean {
  const result = gitExec(['status', '--porcelain'], repoPath);
  return result.success && result.stdout.length > 0;
}

/**
 * Parse .gitignore patterns
 */
export async function getGitIgnorePatterns(repoPath: string): Promise<string[]> {
  const gitignorePath = path.join(repoPath, '.gitignore');
  const content = await readFile(gitignorePath);

  if (!content) return [];

  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}
