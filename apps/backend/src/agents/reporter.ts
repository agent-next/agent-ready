import type { PillarAgentResult } from './base-agent.js';
import type { Evaluation } from './evaluator.js';
import type { ScanContext, Level, Pillar } from 'agent-ready';
import { LEVELS } from 'agent-ready';
import { i18n } from '../i18n/index.js';

export interface ActionItem {
  priority: 'critical' | 'high' | 'medium' | 'low';
  pillar: Pillar;
  level: Level;
  action: string;
  template?: string;
}

export interface PillarDetail {
  pillar: Pillar;
  name: string;
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
  };

  executive_summary: {
    level: Level | null;
    score: number;
    headline: string;
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
      scanDurationMs,
      agentsUsed,
    } = input;

    // Generate headline
    const headline = evaluation.level
      ? `Your repository achieved ${evaluation.level} ${i18n.levels[evaluation.level]}`
      : 'Your repository has not yet reached L1 Functional';

    // Build pillar details
    const pillarDetails: PillarDetail[] = pillarResults.map((p) => ({
      pillar: p.pillar,
      name: i18n.pillars[p.pillar],
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
      },

      executive_summary: {
        level: evaluation.level,
        score: evaluation.overall_score,
        headline,
        key_strengths: evaluation.strengths,
        critical_gaps: evaluation.weaknesses,
        next_steps: this.generateNextSteps(evaluation),
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

        const levelIndex = LEVELS.indexOf(check.level);
        const priority = check.required
          ? levelIndex === 0
            ? 'critical'
            : 'high'
          : levelIndex <= 1
            ? 'medium'
            : 'low';

        items.push({
          priority,
          pillar: pillar.pillar,
          level: check.level,
          action: check.suggestions?.[0] || `Fix: ${check.check_name}`,
          template: check.details?.template as string | undefined,
        });
      }
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return items;
  }

  private generateNextSteps(evaluation: Evaluation): string[] {
    const steps: string[] = [];

    if (!evaluation.level) {
      steps.push('1. Add a README.md file');
      steps.push('2. Create package.json or other package manifest');
    } else if (evaluation.level === 'L1') {
      steps.push('1. Add CONTRIBUTING.md guide');
      steps.push('2. Configure code formatter');
    } else if (evaluation.level === 'L2') {
      steps.push('1. Add CI/CD workflow');
      steps.push('2. Create AGENTS.md file');
    }

    return steps;
  }

  private buildLevelProgress(
    pillarResults: PillarAgentResult[]
  ): { level: Level; achieved: boolean; score: number }[] {
    return LEVELS.map((level) => {
      const levelChecks = pillarResults.flatMap((p) => p.checks.filter((c) => c.level === level));

      const passed = levelChecks.filter((c) => c.passed).length;
      const total = levelChecks.length;
      const score = total > 0 ? Math.round((passed / total) * 100) : 0;

      return {
        level,
        achieved: score >= 80, // Factory.ai compatible
        score,
      };
    });
  }
}
