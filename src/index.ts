#!/usr/bin/env node
/**
 * agent-ready CLI entry point
 *
 * Factory-compatible repo maturity scanner for AI agent readiness
 */

import { Command } from 'commander';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { scanCommand } from './commands/scan.js';
import { initCommand } from './commands/init.js';
import { setLocale, isValidLocale, type Locale } from './i18n/index.js';

// Read version from package.json
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
);

const program = new Command();

program
  .name('agent-ready')
  .description('Factory-compatible repo maturity scanner for AI agent readiness')
  .version(packageJson.version);

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
  .option('--lang <locale>', 'Output language: en, zh', 'en')
  .action(async (scanPath: string, options) => {
    // Set locale if provided
    if (options.lang && isValidLocale(options.lang)) {
      setLocale(options.lang as Locale);
    }
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
  .option('--lang <locale>', 'Output language: en, zh', 'en')
  .action(async (initPath: string, options) => {
    // Set locale if provided
    if (options.lang && isValidLocale(options.lang)) {
      setLocale(options.lang as Locale);
    }
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
