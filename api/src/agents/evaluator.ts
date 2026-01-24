import type { PillarAgentResult } from './base-agent.js';
import type { Level, Pillar } from '../../../src/types.js';
import { LEVELS } from '../../../src/types.js';
import { i18n } from '../i18n/index.js';

export interface CrossPillarInsight {
  type: 'risk' | 'opportunity' | 'strength';
  pillars: Pillar[];
  insight_zh: string;
  insight_en: string;
  recommendation_zh: string;
  recommendation_en: string;
}

export interface Evaluation {
  level: Level | null;
  overall_score: number;
  progress_to_next: number;
  cross_pillar_insights: CrossPillarInsight[];
  strengths: string[];
  weaknesses: string[];
  tech_debt_score: number;
}

export class EvaluatorAgent {
  evaluate(pillarResults: PillarAgentResult[], language: 'zh' | 'en'): Evaluation {
    // Calculate overall score
    const totalPassed = pillarResults.reduce((sum, p) => sum + p.checks_passed, 0);
    const totalChecks = pillarResults.reduce((sum, p) => sum + p.checks_total, 0);
    const overallScore = totalChecks > 0 ? Math.round((totalPassed / totalChecks) * 100) : 0;

    // Determine overall level
    const level = this.determineOverallLevel(pillarResults);

    // Calculate progress to next level
    const progressToNext = this.calculateProgressToNext(pillarResults, level);

    // Generate cross-pillar insights
    const crossPillarInsights = this.generateCrossPillarInsights(pillarResults);

    // Identify strengths and weaknesses
    const { strengths, weaknesses } = this.identifyStrengthsWeaknesses(pillarResults, language);

    // Calculate tech debt score
    const techDebtScore = this.calculateTechDebtScore(pillarResults);

    return {
      level,
      overall_score: overallScore,
      progress_to_next: progressToNext,
      cross_pillar_insights: crossPillarInsights,
      strengths,
      weaknesses,
      tech_debt_score: techDebtScore,
    };
  }

  private determineOverallLevel(pillarResults: PillarAgentResult[]): Level | null {
    for (const level of LEVELS) {
      // Check if all pillars have achieved at least this level
      const allAchieved = pillarResults.every((p) => {
        if (!p.level_achieved) return false;
        return LEVELS.indexOf(p.level_achieved) >= LEVELS.indexOf(level);
      });

      if (!allAchieved) {
        const idx = LEVELS.indexOf(level);
        return idx > 0 ? LEVELS[idx - 1] : null;
      }
    }

    return 'L5';
  }

  private calculateProgressToNext(
    pillarResults: PillarAgentResult[],
    currentLevel: Level | null
  ): number {
    if (currentLevel === 'L5') return 1.0;

    const nextLevel = currentLevel ? LEVELS[LEVELS.indexOf(currentLevel) + 1] : 'L1';

    if (!nextLevel) return 1.0;

    // Calculate how many pillar-level combinations pass at next level
    let passed = 0;
    let total = 0;

    for (const pillar of pillarResults) {
      const nextLevelChecks = pillar.checks.filter((c) => c.level === nextLevel);
      total += nextLevelChecks.length;
      passed += nextLevelChecks.filter((c) => c.passed).length;
    }

    return total > 0 ? passed / total : 0;
  }

  private generateCrossPillarInsights(pillarResults: PillarAgentResult[]): CrossPillarInsight[] {
    const insights: CrossPillarInsight[] = [];
    const pillarMap = new Map(pillarResults.map((p) => [p.pillar, p]));

    // Check for test + build risk
    const test = pillarMap.get('test');
    const build = pillarMap.get('build');
    if (test && build && test.score < 50 && build.score < 50) {
      insights.push({
        type: 'risk',
        pillars: ['test', 'build'],
        insight_zh: '检测到测试覆盖率低且无 CI/CD，代码变更风险高',
        insight_en: 'Low test coverage with no CI/CD detected - high risk for code changes',
        recommendation_zh: '优先建立 CI 流水线并添加基础测试',
        recommendation_en: 'Prioritize CI pipeline setup and add basic tests',
      });
    }

    // Check for docs + env opportunity
    const docs = pillarMap.get('docs');
    const env = pillarMap.get('env');
    if (docs && env && docs.score > 70 && env.score < 50) {
      insights.push({
        type: 'opportunity',
        pillars: ['docs', 'env'],
        insight_zh: '文档完善但缺少开发环境配置，新人上手有障碍',
        insight_en: 'Good docs but missing dev environment setup - onboarding friction',
        recommendation_zh: '添加 devcontainer 或 docker-compose 配置',
        recommendation_en: 'Add devcontainer or docker-compose configuration',
      });
    }

    // Check for security + style strength
    const security = pillarMap.get('security');
    const style = pillarMap.get('style');
    if (security && style && security.score > 80 && style.score > 80) {
      insights.push({
        type: 'strength',
        pillars: ['security', 'style'],
        insight_zh: '安全配置和代码风格都很完善，代码质量高',
        insight_en: 'Strong security and code style configurations - high code quality',
        recommendation_zh: '继续保持当前标准',
        recommendation_en: 'Maintain current standards',
      });
    }

    return insights;
  }

  private identifyStrengthsWeaknesses(
    pillarResults: PillarAgentResult[],
    language: 'zh' | 'en'
  ): { strengths: string[]; weaknesses: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Sort by score
    const sorted = [...pillarResults].sort((a, b) => b.score - a.score);

    // Top 3 are strengths
    for (const pillar of sorted.slice(0, 3)) {
      if (pillar.score >= 70) {
        const name =
          language === 'zh' ? i18n.zh.pillars[pillar.pillar] : i18n.en.pillars[pillar.pillar];
        strengths.push(`${pillar.icon} ${name}: ${pillar.score}%`);
      }
    }

    // Bottom 3 are weaknesses
    for (const pillar of sorted.slice(-3).reverse()) {
      if (pillar.score < 70) {
        const name =
          language === 'zh' ? i18n.zh.pillars[pillar.pillar] : i18n.en.pillars[pillar.pillar];
        weaknesses.push(`${pillar.icon} ${name}: ${pillar.score}%`);
      }
    }

    return { strengths, weaknesses };
  }

  private calculateTechDebtScore(pillarResults: PillarAgentResult[]): number {
    // Tech debt inversely correlates with overall health
    const avgScore = pillarResults.reduce((sum, p) => sum + p.score, 0) / pillarResults.length;
    return Math.round(100 - avgScore);
  }
}
