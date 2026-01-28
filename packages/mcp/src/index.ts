#!/usr/bin/env node
/**
 * agent-ready MCP Server v0.0.2
 *
 * Provides agent-ready context and analysis framework through the Model Context Protocol.
 *
 * Tools:
 * - get_repo_context: Returns project structure, tech stack, key files
 * - get_analysis_framework: Returns 10-pillar/5-level evaluation framework
 * - get_baseline_scan: Quick file-existence check (CLI wrapper)
 * - init_files: Generate missing configuration files
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getRepoContextSchema, getRepoContext } from './tools/get-repo-context.js';
import {
  getAnalysisFrameworkSchema,
  getAnalysisFramework,
} from './tools/get-analysis-framework.js';
import { getBaselineScanSchema, getBaselineScan } from './tools/get-baseline-scan.js';
import { initFilesSchema, initFiles } from './tools/init-files.js';

// Create MCP server
const server = new McpServer({
  name: 'agent-ready',
  version: '0.0.2',
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

// NEW in v0.0.2: Context provider for Claude's own analysis
server.tool(
  'get_repo_context',
  'Get repository context: tech stack, key files, structure. Use this to understand the project before analysis.',
  {
    ...getRepoContextSchema.shape,
  },
  createHandler(getRepoContextSchema, getRepoContext)
);

// NEW in v0.0.2: Analysis framework provider
server.tool(
  'get_analysis_framework',
  'Get the 10-pillar/5-level analysis framework. Returns scoring rubrics and evaluation questions for quality-based assessment.',
  {
    ...getAnalysisFrameworkSchema.shape,
  },
  createHandler(getAnalysisFrameworkSchema, getAnalysisFramework)
);

// Renamed from scan_repository: Now clearly a baseline, not deep analysis
server.tool(
  'get_baseline_scan',
  'Quick file-existence check using CLI. Only checks if files exist, not quality. For deep analysis, use get_repo_context + Read tools.',
  {
    ...getBaselineScanSchema.shape,
  },
  createHandler(getBaselineScanSchema, getBaselineScan)
);

// Kept from v0.0.1: File generation
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
  console.error('agent-ready MCP server v0.0.2 started');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
