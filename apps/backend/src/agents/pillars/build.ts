import { BaseAgent } from '../base-agent.js';
import type { Pillar } from 'agent-ready';

export class BuildAgent extends BaseAgent {
  name = 'Build System';
  pillar: Pillar = 'build';
  icon = '🔧';
}
