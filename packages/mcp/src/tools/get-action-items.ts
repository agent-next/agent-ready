/**
 * get_action_items tool
 *
 * Gets prioritized action items for improving repository agent readiness.
 */

import { z } from 'zod';
import { scan, setLocale, isValidLocale, type Locale } from 'agent-ready';

export const getActionItemsSchema = z.object({
  path: z.string().describe('Path to the repository to scan'),
  priority: z
    .enum(['critical', 'high', 'medium', 'low'])
    .optional()
    .describe('Filter by priority level'),
  limit: z.number().optional().default(10).describe('Maximum number of items to return'),
  lang: z.enum(['en', 'zh']).optional().default('en').describe('Output language'),
});

export type GetActionItemsInput = z.infer<typeof getActionItemsSchema>;

export async function getActionItems(input: GetActionItemsInput): Promise<string> {
  const { path, priority, limit, lang } = input;

  // Set locale
  if (lang && isValidLocale(lang)) {
    setLocale(lang as Locale);
  }

  try {
    const result = await scan({
      path,
      profile: 'factory_compat',
      output: 'json',
      verbose: false,
    });

    let items = result.action_items;

    // Filter by priority if specified
    if (priority) {
      items = items.filter((item) => item.priority === priority);
    }

    // Apply limit
    items = items.slice(0, limit);

    // Format items for response
    const formattedItems = items.map((item) => ({
      priority: item.priority,
      level: item.level,
      pillar: item.pillar,
      action: item.action,
      details: item.details,
      has_template: !!item.template,
    }));

    const response = {
      total_items: result.action_items.length,
      filtered_count: formattedItems.length,
      current_level: result.level,
      target_level: getNextLevel(result.level),
      items: formattedItems,
    };

    return JSON.stringify(response, null, 2);
  } catch (error) {
    throw new Error(
      `Failed to get action items: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function getNextLevel(
  current: 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | null
): 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | null {
  if (!current) return 'L1';
  const levels = ['L1', 'L2', 'L3', 'L4', 'L5'] as const;
  const index = levels.indexOf(current);
  return index < levels.length - 1 ? levels[index + 1] : null;
}
