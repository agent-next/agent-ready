import type { PillarAgentResult } from './base-agent.js';
import type { Evaluation } from './evaluator.js';
import type { ScanContext, Level, Pillar } from '../../../src/types.js';
import { i18n } from '../i18n/index.js';

export interface ActionItem {
  priority: 'critical' | 'high' | 'medium' | 'low';
  pillar: Pillar;
  level: Level;
  action_zh: string;
  action_en: string;
  template?: string;
}

export interface PillarDetail {
  pillar: Pillar;
  name: string;
  name_zh: string;
  icon: string;
  level_achieved: Level | null;
  score: number;
  checks_passed: number;
  checks_total: number;
}

export interface EnhancedReport {
  meta: {
    repo: string;
    commit: string;
    timestamp: string;
    profile: string;
    profile_version: string;
    scan_duration_ms: number;
    agents_used: number;
    language: 'zh' | 'en';
  };

  executive_summary: {
    level: Level | null;
    score: number;
    headline_zh: string;
    headline_en: string;
    key_strengths: string[];
    critical_gaps: string[];
    next_steps: string[];
  };

  detailed_analysis: {
    pillars: PillarDetail[];
    cross_pillar_insights: Evaluation['cross_pillar_insights'];
    tech_debt_score: number;
  };

  improvement_roadmap: {
    quick_wins: ActionItem[];
    short_term: ActionItem[];
    medium_term: ActionItem[];
    long_term: ActionItem[];
  };

  charts: {
    pillar_radar: { pillar: string; score: number }[];
    level_progress: { level: Level; achieved: boolean; score: number }[];
  };
}

interface ReportInput {
  context: ScanContext;
  profile: string;
  profileVersion: string;
  pillarResults: PillarAgentResult[];
  evaluation: Evaluation;
  language: 'zh' | 'en';
  scanDurationMs: number;
  agentsUsed: number;
}

export class ReporterAgent {
  generateReport(input: ReportInput): EnhancedReport {
    const {
      context,
      profile,
      profileVersion,
      pillarResults,
      evaluation,
      language,
      scanDurationMs,
      agentsUsed,
    } = input;

    // Generate headline
    const headlineZh = evaluation.level
      ? `您的仓库已达到 ${evaluation.level} ${i18n.zh.levels[evaluation.level]}`
      : '您的仓库尚未达到 L1 基础级';

    const headlineEn = evaluation.level
      ? `Your repository achieved ${evaluation.level} ${i18n.en.levels[evaluation.level]}`
      : 'Your repository has not yet reached L1 Functional';

    // Build pillar details
    const pillarDetails: PillarDetail[] = pillarResults.map((p) => ({
      pillar: p.pillar,
      name: i18n.en.pillars[p.pillar],
      name_zh: i18n.zh.pillars[p.pillar],
      icon: p.icon || '📦',
      level_achieved: p.level_achieved,
      score: p.score,
      checks_passed: p.checks_passed,
      checks_total: p.checks_total,
    }));

    // Generate action items from failed checks
    const actionItems = this.generateActionItems(pillarResults);

    // Build level progress chart data
    const levelProgress = this.buildLevelProgress(pillarResults);

    return {
      meta: {
        repo: context.repo_name,
        commit: context.commit_sha,
        timestamp: new Date().toISOString(),
        profile,
        profile_version: profileVersion,
        scan_duration_ms: scanDurationMs,
        agents_used: agentsUsed,
        language,
      },

      executive_summary: {
        level: evaluation.level,
        score: evaluation.overall_score,
        headline_zh: headlineZh,
        headline_en: headlineEn,
        key_strengths: evaluation.strengths,
        critical_gaps: evaluation.weaknesses,
        next_steps: this.generateNextSteps(evaluation, language),
      },

      detailed_analysis: {
        pillars: pillarDetails,
        cross_pillar_insights: evaluation.cross_pillar_insights,
        tech_debt_score: evaluation.tech_debt_score,
      },

      improvement_roadmap: {
        quick_wins: actionItems
          .filter((a) => a.priority === 'critical' || a.priority === 'high')
          .slice(0, 3),
        short_term: actionItems.filter((a) => a.priority === 'medium').slice(0, 5),
        medium_term: actionItems.filter((a) => a.priority === 'low').slice(0, 5),
        long_term: [],
      },

      charts: {
        pillar_radar: pillarDetails.map((p) => ({ pillar: p.name, score: p.score })),
        level_progress: levelProgress,
      },
    };
  }

  private generateActionItems(pillarResults: PillarAgentResult[]): ActionItem[] {
    const items: ActionItem[] = [];

    for (const pillar of pillarResults) {
      for (const check of pillar.checks) {
        if (check.passed) continue;

        const priority = check.required
          ? check.level === 'L1'
            ? 'critical'
            : 'high'
          : check.level <= 'L2'
            ? 'medium'
            : 'low';

        items.push({
          priority,
          pillar: pillar.pillar,
          level: check.level,
          action_zh: check.suggestions?.[0] || `修复: ${check.check_name}`,
          action_en: check.suggestions?.[0] || `Fix: ${check.check_name}`,
          template: check.details?.template as string | undefined,
        });
      }
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return items;
  }

  private generateNextSteps(evaluation: Evaluation, language: 'zh' | 'en'): string[] {
    const steps: string[] = [];

    if (!evaluation.level) {
      steps.push(language === 'zh' ? '1. 添加 README.md 文件' : '1. Add a README.md file');
      steps.push(
        language === 'zh'
          ? '2. 创建 package.json 或其他包管理文件'
          : '2. Create package.json or other package manifest'
      );
    } else if (evaluation.level === 'L1') {
      steps.push(
        language === 'zh' ? '1. 添加 CONTRIBUTING.md 贡献指南' : '1. Add CONTRIBUTING.md guide'
      );
      steps.push(language === 'zh' ? '2. 配置代码格式化工具' : '2. Configure code formatter');
    } else if (evaluation.level === 'L2') {
      steps.push(language === 'zh' ? '1. 添加 CI/CD 工作流' : '1. Add CI/CD workflow');
      steps.push(language === 'zh' ? '2. 创建 AGENTS.md 文件' : '2. Create AGENTS.md file');
    }

    return steps;
  }

  private buildLevelProgress(
    pillarResults: PillarAgentResult[]
  ): { level: Level; achieved: boolean; score: number }[] {
    const levels: Level[] = ['L1', 'L2', 'L3', 'L4', 'L5'];

    return levels.map((level) => {
      const levelChecks = pillarResults.flatMap((p) => p.checks.filter((c) => c.level === level));

      const passed = levelChecks.filter((c) => c.passed).length;
      const total = levelChecks.length;
      const score = total > 0 ? Math.round((passed / total) * 100) : 0;

      return {
        level,
        achieved: score >= 60,
        score,
      };
    });
  }
}
