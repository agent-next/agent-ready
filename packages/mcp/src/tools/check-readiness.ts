/**
 * check_repo_readiness MCP tool
 *
 * Wraps the checkRepoReadiness function as an MCP tool.
 * Returns structured readiness data across 9 areas.
 */

import { z } from 'zod';
import { checkRepoReadiness } from 'agent-ready';

export const checkRepoReadinessSchema = z.object({
  path: z.string().describe('Path to the repository to check'),
});

export type CheckRepoReadinessInput = z.infer<typeof checkRepoReadinessSchema>;

export async function checkReadiness(input: CheckRepoReadinessInput): Promise<string> {
  const result = await checkRepoReadiness(input.path);
  return JSON.stringify(result, null, 2);
}
