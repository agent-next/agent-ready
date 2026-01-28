/**
 * Project type detection
 *
 * Detects project type to enable intelligent check filtering.
 * This is the core of the "production control layer" concept:
 * checks should be relevant to what the project actually is.
 */

import * as path from 'node:path';
import type { PackageJson } from '../types.js';
import { fileExists, readFile, findFiles } from '../utils/fs.js';

/**
 * Project types that determine which checks are applicable
 */
export type ProjectType = 'cli' | 'web-service' | 'library' | 'webapp' | 'monorepo' | 'unknown';

/**
 * Extended project metadata for richer context
 */
export interface ProjectTypeInfo {
  type: ProjectType;
  confidence: 'high' | 'medium' | 'low';
  indicators: string[];
}

/**
 * Detect project type from repository contents
 *
 * Detection priority:
 * 1. CLI - has bin field in package.json
 * 2. Monorepo - has workspaces or monorepo markers
 * 3. Web Service - has Docker/K8s or server frameworks
 * 4. Webapp - has React/Vue/Angular/Next.js
 * 5. Library - has main/module exports, no bin
 * 6. Unknown - cannot determine
 */
export async function detectProjectType(
  rootPath: string,
  packageJson?: PackageJson
): Promise<ProjectTypeInfo> {
  const indicators: string[] = [];

  // Check for CLI project (highest priority)
  if (packageJson?.bin) {
    indicators.push('package.json has bin field');
    return {
      type: 'cli',
      confidence: 'high',
      indicators,
    };
  }

  // Check for monorepo (takes precedence over individual project types)
  const monorepoResult = await detectMonorepoType(rootPath, packageJson);
  if (monorepoResult) {
    return monorepoResult;
  }

  // Check for web service (Docker, K8s, server frameworks)
  const webServiceResult = await detectWebService(rootPath, packageJson);
  if (webServiceResult) {
    return webServiceResult;
  }

  // Check for webapp (frontend frameworks)
  const webappResult = await detectWebapp(rootPath, packageJson);
  if (webappResult) {
    return webappResult;
  }

  // Check for library
  const libraryResult = detectLibrary(packageJson);
  if (libraryResult) {
    return libraryResult;
  }

  // Fallback to unknown
  return {
    type: 'unknown',
    confidence: 'low',
    indicators: ['Could not determine project type'],
  };
}

/**
 * Detect monorepo patterns
 */
async function detectMonorepoType(
  rootPath: string,
  packageJson?: PackageJson
): Promise<ProjectTypeInfo | null> {
  const indicators: string[] = [];

  // Check for workspaces
  if (packageJson?.workspaces) {
    indicators.push('package.json has workspaces');
    return {
      type: 'monorepo',
      confidence: 'high',
      indicators,
    };
  }

  // Check for monorepo markers
  const monorepoMarkers = [
    { file: 'lerna.json', name: 'Lerna' },
    { file: 'pnpm-workspace.yaml', name: 'pnpm workspace' },
    { file: 'rush.json', name: 'Rush' },
    { file: 'nx.json', name: 'Nx' },
    { file: 'turbo.json', name: 'Turborepo' },
  ];

  for (const marker of monorepoMarkers) {
    if (await fileExists(path.join(rootPath, marker.file))) {
      indicators.push(`Found ${marker.name} config (${marker.file})`);
      return {
        type: 'monorepo',
        confidence: 'high',
        indicators,
      };
    }
  }

  return null;
}

/**
 * Detect web service patterns (Docker, K8s, server frameworks)
 */
async function detectWebService(
  rootPath: string,
  packageJson?: PackageJson
): Promise<ProjectTypeInfo | null> {
  const indicators: string[] = [];

  // Check for Docker
  if (await fileExists(path.join(rootPath, 'Dockerfile'))) {
    indicators.push('Found Dockerfile');
  }

  // Check for docker-compose
  const composeFiles = ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'];
  for (const composeFile of composeFiles) {
    if (await fileExists(path.join(rootPath, composeFile))) {
      indicators.push(`Found ${composeFile}`);
      break;
    }
  }

  // Check for Kubernetes
  const k8sPatterns = await findFiles('**/k8s/**/*.{yml,yaml}', rootPath);
  if (k8sPatterns.length > 0) {
    indicators.push('Found Kubernetes configs');
  }

  // Check for Helm
  if (await fileExists(path.join(rootPath, 'Chart.yaml'))) {
    indicators.push('Found Helm Chart.yaml');
  }

  // Check for server frameworks in dependencies
  const serverFrameworks = [
    'express',
    'fastify',
    'koa',
    'hapi',
    'nestjs',
    '@nestjs/core',
    'fastapi',
    'flask',
    'django',
    'gin-gonic',
    'echo',
    'actix-web',
    'rocket',
    'axum',
  ];

  const deps = {
    ...packageJson?.dependencies,
    ...packageJson?.devDependencies,
  };

  for (const framework of serverFrameworks) {
    if (deps[framework]) {
      indicators.push(`Found server framework: ${framework}`);
      break;
    }
  }

  // If we have strong indicators, it's a web service
  if (indicators.length >= 2) {
    return {
      type: 'web-service',
      confidence: 'high',
      indicators,
    };
  }

  if (indicators.length === 1) {
    return {
      type: 'web-service',
      confidence: 'medium',
      indicators,
    };
  }

  return null;
}

/**
 * Detect webapp patterns (frontend frameworks)
 */
async function detectWebapp(
  rootPath: string,
  packageJson?: PackageJson
): Promise<ProjectTypeInfo | null> {
  const indicators: string[] = [];

  const deps = {
    ...packageJson?.dependencies,
    ...packageJson?.devDependencies,
  };

  // Frontend frameworks
  const frontendFrameworks = [
    { pkg: 'react', name: 'React' },
    { pkg: 'vue', name: 'Vue' },
    { pkg: '@angular/core', name: 'Angular' },
    { pkg: 'svelte', name: 'Svelte' },
    { pkg: 'next', name: 'Next.js' },
    { pkg: 'nuxt', name: 'Nuxt' },
    { pkg: '@remix-run/react', name: 'Remix' },
    { pkg: 'gatsby', name: 'Gatsby' },
    { pkg: 'astro', name: 'Astro' },
    { pkg: 'solid-js', name: 'SolidJS' },
    { pkg: 'qwik', name: 'Qwik' },
  ];

  for (const framework of frontendFrameworks) {
    if (deps[framework.pkg]) {
      indicators.push(`Found frontend framework: ${framework.name}`);
    }
  }

  // Check for frontend config files
  const frontendConfigs = [
    { file: 'next.config.js', name: 'Next.js' },
    { file: 'next.config.mjs', name: 'Next.js' },
    { file: 'next.config.ts', name: 'Next.js' },
    { file: 'vite.config.ts', name: 'Vite' },
    { file: 'vite.config.js', name: 'Vite' },
    { file: 'nuxt.config.ts', name: 'Nuxt' },
    { file: 'astro.config.mjs', name: 'Astro' },
    { file: 'angular.json', name: 'Angular' },
    { file: 'svelte.config.js', name: 'Svelte' },
  ];

  for (const config of frontendConfigs) {
    if (await fileExists(path.join(rootPath, config.file))) {
      indicators.push(`Found ${config.name} config`);
      break;
    }
  }

  if (indicators.length > 0) {
    return {
      type: 'webapp',
      confidence: indicators.length >= 2 ? 'high' : 'medium',
      indicators,
    };
  }

  return null;
}

/**
 * Detect library patterns
 */
function detectLibrary(packageJson?: PackageJson): ProjectTypeInfo | null {
  if (!packageJson) return null;

  const indicators: string[] = [];

  // Libraries typically have main, module, or exports fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pkg = packageJson as any;

  if (pkg.main) {
    indicators.push('package.json has main field');
  }

  if (pkg.module) {
    indicators.push('package.json has module field');
  }

  if (pkg.exports) {
    indicators.push('package.json has exports field');
  }

  if (pkg.types || pkg.typings) {
    indicators.push('package.json has types field');
  }

  // Check for publishConfig (strong library indicator)
  if (pkg.publishConfig) {
    indicators.push('package.json has publishConfig');
  }

  // Check for files field (usually for publishing)
  if (pkg.files) {
    indicators.push('package.json has files field');
  }

  // If we have library indicators but no bin, it's likely a library
  if (indicators.length >= 2 && !pkg.bin) {
    return {
      type: 'library',
      confidence: 'medium',
      indicators,
    };
  }

  if (indicators.length >= 1 && !pkg.bin) {
    return {
      type: 'library',
      confidence: 'low',
      indicators,
    };
  }

  return null;
}

/**
 * Get human-readable description of project type
 */
export function getProjectTypeDescription(type: ProjectType): string {
  const descriptions: Record<ProjectType, string> = {
    cli: 'Command-line application',
    'web-service': 'Web service / API backend',
    library: 'Reusable library / package',
    webapp: 'Web application (frontend)',
    monorepo: 'Monorepo with multiple packages',
    unknown: 'Unknown project type',
  };
  return descriptions[type];
}

/**
 * Check if a project type matches the applicableTo filter
 *
 * An empty or undefined applicableTo means "applies to all project types".
 * No special sentinel values are treated as wildcards.
 */
export function isApplicableToProjectType(
  applicableTo: ProjectType[] | undefined,
  projectType: ProjectType
): boolean {
  // If no applicableTo specified, check applies to all
  if (!applicableTo || applicableTo.length === 0) {
    return true;
  }

  return applicableTo.includes(projectType);
}
