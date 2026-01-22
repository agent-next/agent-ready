/**
 * Scan command implementation
 */

import * as path from 'node:path';
import chalk from 'chalk';
import type { ScanOptions, Level } from '../types.js';
import { scan } from '../scanner.js';
import { outputJson } from '../output/json.js';
import { outputMarkdown } from '../output/markdown.js';
import { directoryExists } from '../utils/fs.js';

export async function scanCommand(options: ScanOptions): Promise<void> {
  // Validate path exists
  if (!(await directoryExists(options.path))) {
    console.error(chalk.red(`Error: Path does not exist: ${options.path}`));
    process.exit(1);
  }

  // Validate level if provided
  if (options.level && !isValidLevel(options.level)) {
    console.error(chalk.red(`Error: Invalid level: ${options.level}`));
    console.error('Valid levels: L1, L2, L3, L4, L5');
    process.exit(1);
  }

  // Validate output format
  if (!['json', 'markdown', 'both'].includes(options.output)) {
    console.error(chalk.red(`Error: Invalid output format: ${options.output}`));
    console.error('Valid formats: json, markdown, both');
    process.exit(1);
  }

  if (options.verbose) {
    console.log(chalk.dim(`Scanning: ${options.path}`));
    console.log(chalk.dim(`Profile: ${options.profile}`));
  }

  try {
    // Run scan
    const result = await scan(options);

    // Output results
    if (options.output === 'json' || options.output === 'both') {
      const outputPath = options.outputFile || path.join(options.path, 'readiness.json');
      await outputJson(result, outputPath);
      if (options.verbose) {
        console.log(chalk.dim(`JSON output: ${outputPath}`));
      }
    }

    if (options.output === 'markdown' || options.output === 'both') {
      outputMarkdown(result, options.verbose);
    }

    // Exit with appropriate code
    process.exit(result.level ? 0 : 1);
  } catch (error) {
    console.error(chalk.red('Scan failed:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function isValidLevel(level: string): level is Level {
  return ['L1', 'L2', 'L3', 'L4', 'L5'].includes(level);
}
