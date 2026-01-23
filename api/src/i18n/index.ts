export const i18n = {
  zh: {
    title: 'Agent Ready - AI Agent 就绪度检测',
    subtitle: '让每个仓库为 AI Agent 做好准备',
    pillars: {
      docs: '文档',
      style: '代码风格',
      build: '构建系统',
      test: '测试',
      security: '安全',
      observability: '可观测性',
      env: '开发环境',
      task_discovery: '任务发现',
      product: '产品',
    } as Record<string, string>,
    levels: {
      none: '未达标',
      L1: '基础级',
      L2: '文档级',
      L3: '标准级',
      L4: '优化级',
      L5: '自治级',
    } as Record<string, string>,
    scan: {
      placeholder: '输入 GitHub 仓库地址',
      button: '开始扫描',
      scanning: '正在扫描...',
      completed: '扫描完成',
      failed: '扫描失败',
    },
    report: {
      title: '扫描报告',
      summary: '执行摘要',
      details: '详细分析',
      roadmap: '改进路线图',
      quickWins: '快速改进',
      shortTerm: '短期目标',
      mediumTerm: '中期目标',
      longTerm: '长期目标',
      strengths: '优势',
      weaknesses: '待改进',
      techDebt: '技术债务',
      downloadPdf: '下载 PDF',
      share: '分享链接',
    },
  },
  en: {
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
  },
};

export type Language = 'zh' | 'en';

export function t(key: string, lang: Language = 'en'): string {
  const keys = key.split('.');
  let value: unknown = i18n[lang];

  for (const k of keys) {
    if (typeof value === 'object' && value !== null) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}
