#!/usr/bin/env node
/**
 * agent-ready MCP Server v0.2.0
 *
 * Provides agent-ready context and readiness checking through the Model Context Protocol.
 *
 * Tools:
 * - get_repo_context: Returns project structure, tech stack, key files
 * - check_repo_readiness: Check repo readiness across 9 areas
 * - init_files: Generate missing configuration files
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getRepoContextSchema, getRepoContext } from './tools/get-repo-context.js';
import { checkRepoReadinessSchema, checkReadiness } from './tools/check-readiness.js';
import { initFilesSchema, initFiles } from './tools/init-files.js';

// Create MCP server
const server = new McpServer({
  name: 'agent-ready',
  version: '0.2.0',
});

// Helper to create tool handlers with consistent error handling
function createHandler<T extends z.ZodType>(
  schema: T,
  handler: (input: z.infer<T>) => Promise<string>
) {
  return async (args: unknown) => {
    try {
      const parsed = schema.parse(args);
      const result = await handler(parsed);
      return { content: [{ type: 'text' as const, text: result }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text' as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  };
}

// Register tools

// Context provider for understanding the project
server.tool(
  'get_repo_context',
  'Get repository context: tech stack, key files, structure. Use this to understand the project before analysis.',
  {
    ...getRepoContextSchema.shape,
  },
  createHandler(getRepoContextSchema, getRepoContext)
);

// Readiness checker across 9 areas
server.tool(
  'check_repo_readiness',
  'Check repo readiness for AI agents across 9 areas: agent_guidance, code_quality, testing, ci_cd, hooks, branch_rulesets, templates, devcontainer, security. Returns present/missing per area.',
  {
    ...checkRepoReadinessSchema.shape,
  },
  createHandler(checkRepoReadinessSchema, checkReadiness)
);

// File generation
server.tool(
  'init_files',
  'Generate missing configuration files (AGENTS.md, .cursorrules, etc.). Set dry_run=true to preview.',
  {
    ...initFilesSchema.shape,
  },
  createHandler(initFilesSchema, initFiles)
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('agent-ready MCP server v0.2.0 started');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
