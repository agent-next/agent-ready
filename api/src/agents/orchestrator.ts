import { BaseAgent } from './base-agent.js';
import {
  DocsAgent,
  StyleAgent,
  BuildAgent,
  TestAgent,
  SecurityAgent,
  ObservabilityAgent,
  EnvironmentAgent,
  TaskDiscoveryAgent,
  ProductAgent,
} from './pillars/index.js';
import { EvaluatorAgent } from './evaluator.js';
import { ReporterAgent } from './reporter.js';
import { loadProfile } from '../../../src/profiles/index.js';
import { buildScanContext } from '../../../src/engine/context.js';
import type { CheckConfig, Level } from '../../../src/types.js';
import type { EnhancedReport } from './reporter.js';

export interface ScanOptions {
  path: string;
  profile?: string;
  language?: 'zh' | 'en';
  level?: Level;
}

export class OrchestratorAgent {
  private pillarAgents: BaseAgent[];
  private evaluator: EvaluatorAgent;
  private reporter: ReporterAgent;

  constructor() {
    this.pillarAgents = [
      new DocsAgent(),
      new StyleAgent(),
      new BuildAgent(),
      new TestAgent(),
      new SecurityAgent(),
      new ObservabilityAgent(),
      new EnvironmentAgent(),
      new TaskDiscoveryAgent(),
      new ProductAgent(),
    ];
    this.evaluator = new EvaluatorAgent();
    this.reporter = new ReporterAgent();
  }

  async execute(options: ScanOptions): Promise<EnhancedReport> {
    const startTime = Date.now();
    const language = options.language || 'en';

    // 1. Load profile
    const profile = await loadProfile(options.profile || 'factory_compat');
    const checks = profile.checks as CheckConfig[];

    // 2. Build scan context
    const context = await buildScanContext(options.path);

    // 3. Distribute checks to pillar agents
    for (const agent of this.pillarAgents) {
      agent.setChecks(checks);
    }

    // 4. Execute all pillar agents in PARALLEL
    const pillarResults = await Promise.all(
      this.pillarAgents.map((agent) => agent.analyze(context))
    );

    // 5. Evaluate and summarize
    const evaluation = this.evaluator.evaluate(pillarResults, language);

    // 6. Generate report
    const report = this.reporter.generateReport({
      context,
      profile: profile.name,
      profileVersion: profile.version,
      pillarResults,
      evaluation,
      language,
      scanDurationMs: Date.now() - startTime,
      agentsUsed: this.pillarAgents.length,
    });

    return report;
  }
}
