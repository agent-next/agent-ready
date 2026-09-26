// Shared color constants for D3 charts and components

// Level colors (L0-L5)
export const LEVEL_COLORS = [
  '#94a3b8', // L0 - gray (starting level)
  '#ef4444', // L1 - red
  '#f59e0b', // L2 - orange
  '#eab308', // L3 - yellow
  '#22c55e', // L4 - green
  '#10b981', // L5 - emerald
] as const;

// Level names (L0-L5)
export const LEVEL_NAMES = [
  'Starting', // L0
  'Functional', // L1
  'Documented', // L2
  'Standardized', // L3
  'Optimized', // L4
  'Autonomous', // L5
] as const;

// Chart colors (matching Tailwind theme)
export const CHART_COLORS = {
  // Primary accent (burnt orange)
  primary: '#C75D28',
  primaryLight: 'rgba(199, 93, 40, 0.2)',

  // Background colors
  background: '#FAF8F5',
  backgroundSecondary: '#F5F2ED',
  backgroundTertiary: '#EBE7E0',

  // Border/grid colors
  grid: '#D5CEC3',
  border: '#D5CEC3',
  line: '#D5CEC3',
  inactive: '#E8E4DE',

  // Text colors
  text: '#5C5348',
  textDark: '#1A1612',
  textMuted: '#8C8377',

  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
} as const;

// Insight type styling
export const INSIGHT_ICONS: Record<string, string> = {
  risk: '⚠️',
  opportunity: '💡',
  strength: '✨',
};

export const INSIGHT_COLORS: Record<string, string> = {
  risk: 'border-level-1/30 bg-level-1/10',
  opportunity: 'border-level-3/30 bg-level-3/10',
  strength: 'border-level-4/30 bg-level-4/10',
};

// Tailwind class mappings (L0-L5)
export const LEVEL_BG_CLASSES = [
  'bg-slate-400', // L0
  'bg-level-1', // L1
  'bg-level-2', // L2
  'bg-level-3', // L3
  'bg-level-4', // L4
  'bg-level-5', // L5
] as const;

export const LEVEL_TEXT_CLASSES = [
  'text-slate-400', // L0
  'text-level-1', // L1
  'text-level-2', // L2
  'text-level-3', // L3
  'text-level-4', // L4
  'text-level-5', // L5
] as const;

// Helper function for tech debt color
export function getTechDebtColor(score: number): string {
  if (score > 50) return 'text-level-1';
  if (score > 25) return 'text-level-2';
  return 'text-level-4';
}

// Helper function for impact/effort badge colors
export function getImpactColor(impact: string): string {
  switch (impact) {
    case 'high':
      return 'bg-level-4/20 text-level-4';
    case 'medium':
      return 'bg-level-3/20 text-level-3';
    default:
      return 'bg-level-2/20 text-level-2';
  }
}

export function getEffortColor(effort: string): string {
  switch (effort) {
    case 'low':
      return 'bg-level-4/20 text-level-4';
    case 'medium':
      return 'bg-level-3/20 text-level-3';
    default:
      return 'bg-level-1/20 text-level-1';
  }
}
