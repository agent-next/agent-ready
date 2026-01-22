#!/usr/bin/env node
/**
 * agent-readiness CLI entry point
 *
 * Factory-compatible repo maturity scanner for AI agent readiness
 */

import { Command } from 'commander';
import * as path from 'node:path';
import { scanCommand } from './commands/scan.js';
import { initCommand } from './commands/init.js';

const program = new Command();

program
  .name('agent-ready')
  .description('Factory-compatible repo maturity scanner for AI agent readiness')
  .version('0.1.0');

// Scan command
program
  .command('scan')
  .description('Scan a repository for agent readiness')
  .argument('[path]', 'Path to repository', '.')
  .option('-p, --profile <name>', 'Profile to use', 'factory_compat')
  .option('-o, --output <format>', 'Output format: json, markdown, both', 'both')
  .option('-l, --level <level>', 'Target level to check (L1-L5)')
  .option('-v, --verbose', 'Verbose output', false)
  .option('--output-file <path>', 'Output file path for JSON results')
  .action(async (scanPath: string, options) => {
    const resolvedPath = path.resolve(process.cwd(), scanPath);
    await scanCommand({
      path: resolvedPath,
      profile: options.profile,
      output: options.output,
      level: options.level,
      verbose: options.verbose,
      outputFile: options.outputFile,
    });
  });

// Init command
program
  .command('init')
  .description('Generate missing agent-ready files')
  .argument('[path]', 'Path to repository', '.')
  .option('-l, --level <level>', 'Generate files needed for level (L1-L5)')
  .option('-c, --check <id>', 'Generate file for specific check only')
  .option('-n, --dry-run', 'Show what would be created without creating', false)
  .option('-f, --force', 'Overwrite existing files', false)
  .option('-i, --interactive', 'Interactive mode with prompts', false)
  .action(async (initPath: string, options) => {
    const resolvedPath = path.resolve(process.cwd(), initPath);
    await initCommand({
      path: resolvedPath,
      level: options.level,
      check: options.check,
      dryRun: options.dryRun,
      force: options.force,
      interactive: options.interactive,
    });
  });

// Parse arguments and run
program.parse();
