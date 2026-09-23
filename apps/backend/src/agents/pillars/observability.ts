import { BaseAgent } from '../base-agent.js';
import type { Pillar } from 'agent-ready';

export class ObservabilityAgent extends BaseAgent {
  name = 'Debugging & Observability';
  pillar: Pillar = 'observability';
  icon = '📊';
}
