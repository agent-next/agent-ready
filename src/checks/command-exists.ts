/**
 * command_exists check implementation
 *
 * Checks if CLI tools are available in the system PATH.
 * Used for VCS CLI tools detection (gh, git-lfs, etc.)
 */

import type { CheckResult, ScanContext, Pillar, Level } from '../types.js';
import { execSafe } from '../utils/exec.js';

export interface CommandExistsCheck {
  type: 'command_exists';
  id: string;
  name: string;
  description: string;
  pillar: Pillar;
  level: Level;
  required: boolean;
  commands: string[];
  require_all?: boolean;
}

function checkCommandExists(command: string): boolean {
  const result = execSafe('which', [command]);
  if (result.success) {
    return true;
  }

  const whereResult = execSafe('where', [command]);
  return whereResult.success;
}

export async function executeCommandExists(
  check: CommandExistsCheck,
  _context: ScanContext
): Promise<CheckResult> {
  const foundCommands: string[] = [];
  const missingCommands: string[] = [];

  for (const command of check.commands) {
    if (checkCommandExists(command)) {
      foundCommands.push(command);
    } else {
      missingCommands.push(command);
    }
  }

  const requireAll = check.require_all ?? false;
  const passed = requireAll ? missingCommands.length === 0 : foundCommands.length > 0;

  if (passed) {
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: true,
      required: check.required,
      message: `CLI tools available: ${foundCommands.join(', ')}`,
      details: {
        found: foundCommands,
        missing: missingCommands,
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
    message: requireAll
      ? `Missing CLI tools: ${missingCommands.join(', ')}`
      : `No CLI tools found from: ${check.commands.join(', ')}`,
    suggestions: missingCommands.map((cmd) => `Install ${cmd} CLI tool`),
    details: {
      found: foundCommands,
      missing: missingCommands,
    },
  };
}
