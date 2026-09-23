export const i18n = {
  title: 'Agent Ready - AI Agent Readiness Scanner',
  subtitle: 'Make every repository agent-ready',
  pillars: {
    docs: 'Documentation',
    style: 'Style & Validation',
    build: 'Build System',
    test: 'Testing',
    security: 'Security',
    observability: 'Observability',
    env: 'Environment',
    task_discovery: 'Task Discovery',
    product: 'Product',
  } as Record<string, string>,
  levels: {
    none: 'Not Achieved',
    L1: 'Functional',
    L2: 'Documented',
    L3: 'Standardized',
    L4: 'Optimized',
    L5: 'Autonomous',
  } as Record<string, string>,
  scan: {
    placeholder: 'Enter GitHub repository URL',
    button: 'Start Scan',
    scanning: 'Scanning...',
    completed: 'Scan completed',
    failed: 'Scan failed',
  },
  report: {
    title: 'Scan Report',
    summary: 'Executive Summary',
    details: 'Detailed Analysis',
    roadmap: 'Improvement Roadmap',
    quickWins: 'Quick Wins',
    shortTerm: 'Short Term',
    mediumTerm: 'Medium Term',
    longTerm: 'Long Term',
    strengths: 'Strengths',
    weaknesses: 'Areas for Improvement',
    techDebt: 'Tech Debt',
    downloadPdf: 'Download PDF',
    share: 'Share Link',
  },
};

export function t(key: string): string {
  const keys = key.split('.');
  let value: unknown = i18n;

  for (const k of keys) {
    if (typeof value === 'object' && value !== null) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}
