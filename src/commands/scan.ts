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
import { t } from '../i18n/index.js';

export async function scanCommand(options: ScanOptions): Promise<void> {
  // Validate path exists
  if (!(await directoryExists(options.path))) {
    console.error(
      chalk.red(t('cli.error', { message: t('cli.pathNotFound', { path: options.path }) }))
    );
    process.exit(1);
  }

  // Validate level if provided
  if (options.level && !isValidLevel(options.level)) {
    console.error(
      chalk.red(t('cli.error', { message: t('cli.invalidLevel', { level: options.level }) }))
    );
    console.error(t('cli.validLevels'));
    process.exit(1);
  }

  // Validate output format
  if (!['json', 'markdown', 'both'].includes(options.output)) {
    console.error(
      chalk.red(t('cli.error', { message: t('cli.invalidOutput', { format: options.output }) }))
    );
    console.error(t('cli.validOutputs'));
    process.exit(1);
  }

  if (options.verbose) {
    console.log(chalk.dim(t('cli.scanning', { path: options.path })));
    console.log(chalk.dim(t('cli.profile', { profile: options.profile })));
  }

  try {
    // Run scan
    const result = await scan(options);

    // Output results
    if (options.output === 'json' || options.output === 'both') {
      const outputPath = options.outputFile || path.join(options.path, 'readiness.json');
      await outputJson(result, outputPath);
      if (options.verbose) {
        console.log(chalk.dim(t('cli.jsonOutput', { path: outputPath })));
      }
    }

    if (options.output === 'markdown' || options.output === 'both') {
      outputMarkdown(result, options.verbose);
    }

    // Exit with appropriate code
    process.exit(result.level ? 0 : 1);
  } catch (error) {
    console.error(chalk.red(t('cli.scanFailed')), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function isValidLevel(level: string): level is Level {
  return ['L1', 'L2', 'L3', 'L4', 'L5'].includes(level);
}
