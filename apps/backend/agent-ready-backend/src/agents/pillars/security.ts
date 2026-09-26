import { BaseAgent } from '../base-agent.js';
import type { Pillar } from 'agent-ready';

export class SecurityAgent extends BaseAgent {
  name = 'Security';
  name_zh = '安全';
  pillar: Pillar = 'security';
  icon = '🔒';
}
