/**
 * Scan context builder
 *
 * Creates the context object passed to all checks during a scan
 */

import * as path from 'node:path';
import type { ScanContext, PackageJson } from '../types.js';
import { readFile, fileExists, directoryExists, findFiles } from '../utils/fs.js';
import { getCommitSha, getRepoName } from '../utils/git.js';

/**
 * Build scan context for a repository
 */
export async function buildScanContext(rootPath: string): Promise<ScanContext> {
  const repoName = getRepoName(rootPath);
  const commitSha = getCommitSha(rootPath);

  // Load package.json if it exists
  const packageJson = await loadPackageJson(rootPath);

  // Detect monorepo
  const { isMonorepo, apps } = await detectMonorepo(rootPath, packageJson);

  return {
    root_path: rootPath,
    repo_name: repoName,
    commit_sha: commitSha,
    file_cache: new Map(),
    glob_cache: new Map(),
    package_json: packageJson,
    is_monorepo: isMonorepo,
    monorepo_apps: apps,
  };
}

/**
 * Load and parse package.json
 */
async function loadPackageJson(rootPath: string): Promise<PackageJson | undefined> {
  const packageJsonPath = path.join(rootPath, 'package.json');
  const content = await readFile(packageJsonPath);

  if (!content) return undefined;

  try {
    return JSON.parse(content) as PackageJson;
  } catch {
    return undefined;
  }
}

/**
 * Detect if repo is a monorepo and find app directories
 */
async function detectMonorepo(
  rootPath: string,
  packageJson?: PackageJson
): Promise<{ isMonorepo: boolean; apps: string[] }> {
  const apps: string[] = [];

  // Check for yarn/npm workspaces
  if (packageJson?.workspaces) {
    const workspaces = Array.isArray(packageJson.workspaces)
      ? packageJson.workspaces
      : packageJson.workspaces.packages || [];

    for (const pattern of workspaces) {
      const matches = await findFiles(pattern, rootPath);
      // Get directory names from matched package.json files
      for (const match of matches) {
        const dir = path.dirname(match);
        const relDir = path.relative(rootPath, dir);
        if (relDir && relDir !== '.') {
          apps.push(relDir);
        }
      }
    }

    if (apps.length > 0) {
      return { isMonorepo: true, apps };
    }
  }

  // Check for common monorepo patterns
  const monorepoMarkers = ['lerna.json', 'pnpm-workspace.yaml', 'rush.json', 'nx.json'];

  for (const marker of monorepoMarkers) {
    if (await fileExists(path.join(rootPath, marker))) {
      // Try to find apps/packages directories
      const commonDirs = ['apps', 'packages', 'libs', 'services'];
      for (const dir of commonDirs) {
        const dirPath = path.join(rootPath, dir);
        if (await directoryExists(dirPath)) {
          const subDirs = await findFiles(`${dir}/*/package.json`, rootPath);
          for (const subDir of subDirs) {
            const relDir = path.relative(rootPath, path.dirname(subDir));
            apps.push(relDir);
          }
        }
      }
      return { isMonorepo: true, apps };
    }
  }

  // Check for apps/ or packages/ directories even without markers
  const commonDirs = ['apps', 'packages'];
  for (const dir of commonDirs) {
    const subPackages = await findFiles(`${dir}/*/package.json`, rootPath);
    if (subPackages.length >= 2) {
      for (const subPackage of subPackages) {
        const relDir = path.relative(rootPath, path.dirname(subPackage));
        apps.push(relDir);
      }
      return { isMonorepo: true, apps };
    }
  }

  return { isMonorepo: false, apps: [] };
}
