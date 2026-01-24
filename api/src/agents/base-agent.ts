import type { CheckConfig, CheckResult, ScanContext, Pillar, Level } from '../../../src/types.js';
import { executeCheck } from '../../../src/checks/index.js';
import { LEVELS } from '../../../src/types.js';

export interface PillarAgentResult {
  pillar: Pillar;
  name: string;
  name_zh: string;
  icon: string;
  level_achieved: Level | null;
  score: number;
  checks_passed: number;
  checks_total: number;
  checks: CheckResult[];
  insights: string[];
  recommendations: string[];
  execution_time_ms: number;
}

export abstract class BaseAgent {
  abstract name: string;
  abstract name_zh: string;
  abstract pillar: Pillar;
  abstract icon: string;

  protected checks: CheckConfig[] = [];

  setChecks(checks: CheckConfig[]): void {
    this.checks = checks.filter((c) => c.pillar === this.pillar);
  }

  async analyze(context: ScanContext): Promise<PillarAgentResult> {
    const startTime = Date.now();

    // Execute all checks in parallel
    const results = await Promise.all(this.checks.map((check) => executeCheck(check, context)));

    const passed = results.filter((r) => r.passed).length;
    const total = results.length;
    const score = total > 0 ? Math.round((passed / total) * 100) : 0;

    // Determine highest level achieved
    const levelAchieved = this.calculateLevelAchieved(results);

    // Generate insights and recommendations
    const insights = this.generateInsights(results);
    const recommendations = this.generateRecommendations(results);

    return {
      pillar: this.pillar,
      name: this.name,
      name_zh: this.name_zh,
      icon: this.icon,
      level_achieved: levelAchieved,
      score,
      checks_passed: passed,
      checks_total: total,
      checks: results,
      insights,
      recommendations,
      execution_time_ms: Date.now() - startTime,
    };
  }

  protected calculateLevelAchieved(results: CheckResult[]): Level | null {
    for (const level of LEVELS) {
      const levelChecks = results.filter((r) => r.level === level);
      if (levelChecks.length === 0) continue;

      const passed = levelChecks.filter((r) => r.passed).length;
      const requiredPassed = levelChecks.filter((r) => r.required && r.passed).length;
      const requiredTotal = levelChecks.filter((r) => r.required).length;

      // 60% threshold + all required must pass
      const passRate = passed / levelChecks.length;
      if (passRate < 0.6 || requiredPassed < requiredTotal) {
        // Return previous level or null
        const idx = LEVELS.indexOf(level);
        return idx > 0 ? LEVELS[idx - 1] : null;
      }
    }

    // All levels passed
    return 'L5';
  }

  protected generateInsights(results: CheckResult[]): string[] {
    const insights: string[] = [];
    const passed = results.filter((r) => r.passed);
    const failed = results.filter((r) => !r.passed);

    if (passed.length === results.length) {
      insights.push(`${this.icon} ${this.name}: All ${results.length} checks passed`);
    } else {
      insights.push(`${this.icon} ${this.name}: ${passed.length}/${results.length} checks passed`);
    }

    // Add specific insights for critical failures
    const criticalFailures = failed.filter((r) => r.required);
    if (criticalFailures.length > 0) {
      insights.push(`⚠️ ${criticalFailures.length} required checks failed`);
    }

    return insights;
  }

  protected generateRecommendations(results: CheckResult[]): string[] {
    const recommendations: string[] = [];
    const failed = results.filter((r) => !r.passed);

    // Sort by level (L1 first) and required status
    failed.sort((a, b) => {
      if (a.required !== b.required) return a.required ? -1 : 1;
      return a.level.localeCompare(b.level);
    });

    // Take top 3 recommendations
    for (const check of failed.slice(0, 3)) {
      if (check.suggestions && check.suggestions.length > 0) {
        recommendations.push(check.suggestions[0]);
      } else {
        recommendations.push(`Fix: ${check.check_name}`);
      }
    }

    return recommendations;
  }
}
