#!/usr/bin/env node
/**
 * agent-ready CLI entry point
 *
 * Check repo readiness for AI coding agents
 */

import { Command } from 'commander';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initCommand } from './commands/init.js';
import { checkCommand } from './commands/check.js';

// Read version from package.json
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
);

const program = new Command();

program
  .name('agent-ready')
  .description('Check repo readiness for AI coding agents')
  .version(packageJson.version);

// Init command
program
  .command('init')
  .description('Generate missing agent-ready files')
  .argument('[path]', 'Path to repository', '.')
  .option('-c, --check <id>', 'Generate file for specific check only')
  .option('-n, --dry-run', 'Show what would be created without creating', false)
  .option('-f, --force', 'Overwrite existing files', false)
  .action(async (initPath: string, options) => {
    const resolvedPath = path.resolve(process.cwd(), initPath);
    await initCommand({
      path: resolvedPath,
      check: options.check,
      dryRun: options.dryRun,
      force: options.force,
    });
  });

// Check command
program
  .command('check [path]')
  .description('Check repo readiness for AI agents')
  .option('--json', 'Output as JSON')
  .option('--strict', 'Exit with code 1 if anything missing')
  .action(async (targetPath = '.', options) => {
    await checkCommand(path.resolve(targetPath), options);
  });

// Parse arguments and run
program.parse();
