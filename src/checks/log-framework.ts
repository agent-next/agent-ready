/**
 * log_framework_detect check implementation
 *
 * Detects if logging frameworks are used in the project
 */

import type { LogFrameworkDetectCheck, CheckResult, ScanContext } from '../types.js';
import { readFileCached, findFilesCached, relativePath } from '../utils/fs.js';

// Known logging frameworks by language/ecosystem
const FRAMEWORK_PATTERNS: Record<string, RegExp[]> = {
  // Node.js
  winston: [/require\(['"]winston['"]\)/, /from\s+['"]winston['"]/],
  pino: [/require\(['"]pino['"]\)/, /from\s+['"]pino['"]/],
  bunyan: [/require\(['"]bunyan['"]\)/, /from\s+['"]bunyan['"]/],
  log4js: [/require\(['"]log4js['"]\)/, /from\s+['"]log4js['"]/],

  // Python
  logging: [/import\s+logging/, /from\s+logging\s+import/],
  loguru: [/from\s+loguru\s+import/, /import\s+loguru/],
  structlog: [/import\s+structlog/, /from\s+structlog/],

  // Go
  logrus: [/github\.com\/sirupsen\/logrus/],
  zap: [/go\.uber\.org\/zap/],
  zerolog: [/github\.com\/rs\/zerolog/],

  // Java
  slf4j: [/org\.slf4j/],
  log4j: [/org\.apache\.log4j/, /org\.apache\.logging\.log4j/],
  logback: [/ch\.qos\.logback/],

  // Rust
  'log/env_logger': [/use\s+log::/, /use\s+env_logger/],
  tracing: [/use\s+tracing/],
};

export async function executeLogFrameworkDetect(
  check: LogFrameworkDetectCheck,
  context: ScanContext
): Promise<CheckResult> {
  const foundFrameworks: Array<{ framework: string; source: string }> = [];

  // Check package.json dependencies
  if (context.package_json) {
    const deps = {
      ...context.package_json.dependencies,
      ...context.package_json.devDependencies,
    };

    for (const framework of check.frameworks) {
      if (deps[framework]) {
        foundFrameworks.push({ framework, source: 'package.json' });
      }
    }
  }

  // If found in package.json, we're done
  if (foundFrameworks.length > 0) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: true,
      required: check.required,
      message: `Found logging framework(s): ${foundFrameworks.map((f) => f.framework).join(', ')}`,
      matched_files: ['package.json'],
      details: {
        frameworks: foundFrameworks,
      },
    };
  }

  // Search source files for framework imports
  const sourcePatterns = ['**/*.ts', '**/*.js', '**/*.py', '**/*.go', '**/*.java', '**/*.rs'];

  for (const pattern of sourcePatterns) {
    const files = await findFilesCached(pattern, context.root_path, context.glob_cache);

    // Limit search to avoid scanning too many files
    const filesToCheck = files.slice(0, 100);

    for (const filePath of filesToCheck) {
      const content = await readFileCached(filePath, context.file_cache);
      if (!content) continue;

      for (const framework of check.frameworks) {
        const patterns = FRAMEWORK_PATTERNS[framework];
        if (!patterns) continue;

        for (const pattern of patterns) {
          if (pattern.test(content)) {
            foundFrameworks.push({
              framework,
              source: relativePath(filePath, context.root_path),
            });
            break;
          }
        }
      }

      // Early exit if we found something
      if (foundFrameworks.length > 0) {
        break;
      }
    }

    if (foundFrameworks.length > 0) {
      break;
    }
  }

  if (foundFrameworks.length > 0) {
    const matchedFiles = [...new Set(foundFrameworks.map((f) => f.source))];
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: true,
      required: check.required,
      message: `Found logging framework(s): ${foundFrameworks.map((f) => f.framework).join(', ')}`,
      matched_files: matchedFiles,
      details: {
        frameworks: foundFrameworks,
      },
    };
  }

  return {
    check_id: check.id,
    check_name: check.name,
    pillar: check.pillar,
    level: check.level,
    passed: false,
    required: check.required,
    message: `No logging framework detected (looking for: ${check.frameworks.join(', ')})`,
    suggestions: [
      'Add a logging framework to your project',
      'Node.js: npm install winston or pino',
      'Python: pip install loguru',
    ],
    details: {
      searched_for: check.frameworks,
    },
  };
}
