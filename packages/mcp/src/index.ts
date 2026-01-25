#!/usr/bin/env node
/**
 * agent-ready MCP Server
 *
 * Provides agent-ready scanning capabilities through the Model Context Protocol.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { scanRepositorySchema, scanRepository } from './tools/scan-repository.js';
import { getActionItemsSchema, getActionItems } from './tools/get-action-items.js';
import { initFilesSchema, initFiles } from './tools/init-files.js';
import { listProfilesSchema, listProfilesHandler } from './tools/list-profiles.js';

// Create MCP server
const server = new McpServer({
  name: 'agent-ready',
  version: '0.0.1',
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
server.tool(
  'scan_repository',
  'Scan a repository for AI agent readiness. Returns level (L1-L5), overall score, pillar breakdown, and statistics.',
  {
    ...scanRepositorySchema.shape,
  },
  createHandler(scanRepositorySchema, scanRepository)
);

server.tool(
  'get_action_items',
  'Get prioritized action items for improving agent readiness. Filter by priority (critical/high/medium/low).',
  {
    ...getActionItemsSchema.shape,
  },
  createHandler(getActionItemsSchema, getActionItems)
);

server.tool(
  'init_files',
  'Generate missing configuration files. Set dry_run=true to preview, dry_run=false to create files.',
  {
    ...initFilesSchema.shape,
  },
  createHandler(initFilesSchema, initFiles)
);

server.tool(
  'list_profiles',
  'List available scanning profiles with descriptions and pillar/level coverage.',
  {
    ...listProfilesSchema.shape,
  },
  createHandler(listProfilesSchema, listProfilesHandler)
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('agent-ready MCP server started');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
