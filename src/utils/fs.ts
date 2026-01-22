/**
 * File system utilities with caching
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read file contents, returns null if file doesn't exist
 */
export async function readFile(filePath: string): Promise<string | null> {
  try {
    return await fs.promises.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Read file contents with caching
 */
export async function readFileCached(
  filePath: string,
  cache: Map<string, string>
): Promise<string | null> {
  if (cache.has(filePath)) {
    return cache.get(filePath)!;
  }

  const content = await readFile(filePath);
  if (content !== null) {
    cache.set(filePath, content);
  }
  return content;
}

/**
 * Find files matching a glob pattern
 */
export async function findFiles(
  pattern: string,
  rootPath: string
): Promise<string[]> {
  try {
    const matches = await glob(pattern, {
      cwd: rootPath,
      nodir: true,
      dot: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    });
    return matches.map((m) => path.join(rootPath, m));
  } catch {
    return [];
  }
}

/**
 * Find files with caching
 */
export async function findFilesCached(
  pattern: string,
  rootPath: string,
  cache: Map<string, string[]>
): Promise<string[]> {
  const cacheKey = `${rootPath}:${pattern}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const matches = await findFiles(pattern, rootPath);
  cache.set(cacheKey, matches);
  return matches;
}

/**
 * Check if a directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * List directories in a path
 */
export async function listDirectories(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

/**
 * Write file, creating directories if needed
 */
export async function writeFile(
  filePath: string,
  content: string
): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(filePath, content, 'utf-8');
}

/**
 * Get relative path from root
 */
export function relativePath(fullPath: string, rootPath: string): string {
  return path.relative(rootPath, fullPath);
}
