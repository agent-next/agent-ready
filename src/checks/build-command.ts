/**
 * build_command_detect check implementation
 *
 * Detects if build/test commands are defined in package.json, Makefile, etc.
 */

import type { BuildCommandDetectCheck, CheckResult, ScanContext } from '../types.js';
import { readFileCached, safePath } from '../utils/fs.js';

const DEFAULT_FILES = ['package.json', 'Makefile', 'pyproject.toml', 'Cargo.toml', 'go.mod'];

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
    // Validate path doesn't escape root directory
    const filePath = safePath(file, context.root_path);
    if (!filePath) continue;

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
    // Python projects with pyproject.toml have implicit build/test capability
    // - [build-system] means the project can be built via `pip install` or `python -m build`
    // - pytest/unittest tests are run via `pytest` or `python -m pytest`
    for (const cmd of commandsToFind) {
      if (cmd === 'build') {
        // Build is available if build-system is defined
        if (content.includes('[build-system]') || content.includes('[project]')) {
          found.push(cmd);
        }
      } else if (cmd === 'test') {
        // Test is available if pytest, tox, or test dependencies are configured
        if (
          content.includes('pytest') ||
          content.includes('[tool.pytest') ||
          content.includes('tests') ||
          content.includes('tox')
        ) {
          found.push(cmd);
        }
      } else {
        // Check for explicit script definition
        const scriptRegex = new RegExp(`${escapeRegex(cmd)}\\s*=`, 'm');
        if (scriptRegex.test(content)) {
          found.push(cmd);
        }
      }
    }
  } else if (filename === 'Cargo.toml' || filename === 'go.mod') {
    // Cargo and Go have implicit build/test commands
    for (const cmd of commandsToFind) {
      if (cmd === 'build' || cmd === 'test') {
        found.push(cmd);
      }
    }
  } else if (filename === 'setup.py') {
    // Python setup.py has implicit build/test capability
    for (const cmd of commandsToFind) {
      if (cmd === 'build') {
        // Any setup.py can be built
        found.push(cmd);
      } else if (cmd === 'test') {
        // Check if tests are mentioned
        if (
          content.includes('test_suite') ||
          content.includes('pytest') ||
          content.includes('tests')
        ) {
          found.push(cmd);
        }
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
