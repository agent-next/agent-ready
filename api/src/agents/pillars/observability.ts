import { BaseAgent } from '../base-agent.js';
import type { Pillar } from '../../../../src/types.js';

export class ObservabilityAgent extends BaseAgent {
  name = 'Debugging & Observability';
  name_zh = '可观测性';
  pillar: Pillar = 'observability';
  icon = '📊';
}
