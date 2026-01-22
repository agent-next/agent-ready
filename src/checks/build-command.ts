/**
 * build_command_detect check implementation
 *
 * Detects if build/test commands are defined in package.json, Makefile, etc.
 */

import * as path from 'node:path';
import type {
  BuildCommandDetectCheck,
  CheckResult,
  ScanContext,
} from '../types.js';
import { readFileCached, relativePath } from '../utils/fs.js';

const DEFAULT_FILES = ['package.json', 'Makefile', 'pyproject.toml', 'Cargo.toml'];

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function executeBuildCommandDetect(
  check: BuildCommandDetectCheck,
  context: ScanContext
): Promise<CheckResult> {
  const filesToCheck = check.files || DEFAULT_FILES;
  const foundCommands: Array<{ file: string; command: string }> = [];

  for (const file of filesToCheck) {
    const filePath = path.join(context.root_path, file);
    const content = await readFileCached(filePath, context.file_cache);

    if (!content) continue;

    const commands = detectCommandsInFile(file, content, check.commands);
    for (const command of commands) {
      foundCommands.push({ file, command });
    }
  }

  if (foundCommands.length > 0) {
    const matchedFiles = [...new Set(foundCommands.map((c) => c.file))];
    const commandList = foundCommands.map((c) => `${c.command} (${c.file})`);

    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: true,
      required: check.required,
      message: `Found ${foundCommands.length} build command(s): ${foundCommands.map((c) => c.command).join(', ')}`,
      matched_files: matchedFiles,
      details: {
        commands: commandList,
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
    message: `No build commands found matching: ${check.commands.join(', ')}`,
    suggestions: [
      'Add build/test scripts to package.json',
      'Example: "scripts": { "build": "...", "test": "..." }',
    ],
    details: {
      searched_files: filesToCheck,
      looking_for: check.commands,
    },
  };
}

function detectCommandsInFile(
  filename: string,
  content: string,
  commandsToFind: string[]
): string[] {
  const found: string[] = [];

  if (filename === 'package.json') {
    try {
      const pkg = JSON.parse(content);
      const scripts = pkg.scripts || {};

      for (const cmd of commandsToFind) {
        if (scripts[cmd]) {
          found.push(cmd);
        }
      }
    } catch {
      // Ignore parse errors
    }
  } else if (filename === 'Makefile') {
    // Look for make targets (escape command to prevent regex injection)
    for (const cmd of commandsToFind) {
      const targetRegex = new RegExp(`^${escapeRegex(cmd)}\\s*:`, 'm');
      if (targetRegex.test(content)) {
        found.push(cmd);
      }
    }
  } else if (filename === 'pyproject.toml') {
    // Look for scripts section or tool.poetry.scripts (escape command)
    for (const cmd of commandsToFind) {
      const scriptRegex = new RegExp(`${escapeRegex(cmd)}\\s*=`, 'm');
      if (scriptRegex.test(content)) {
        found.push(cmd);
      }
    }
  } else if (filename === 'Cargo.toml') {
    // Cargo has implicit build/test
    for (const cmd of commandsToFind) {
      if (cmd === 'build' || cmd === 'test') {
        found.push(cmd);
      }
    }
  } else {
    // Generic detection: look for command strings in content
    for (const cmd of commandsToFind) {
      if (content.includes(cmd)) {
        found.push(cmd);
      }
    }
  }

  return found;
}
