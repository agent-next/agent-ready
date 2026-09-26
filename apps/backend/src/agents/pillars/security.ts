import { BaseAgent } from '../base-agent.js';
import type { Pillar } from 'agent-ready';

export class SecurityAgent extends BaseAgent {
  name = 'Security';
  pillar: Pillar = 'security';
  icon = '🔒';
}
