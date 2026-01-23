import { BaseAgent } from '../base-agent.js';
import type { Pillar } from '../../../../src/types.js';

export class SecurityAgent extends BaseAgent {
  name = 'Security';
  name_zh = '安全';
  pillar: Pillar = 'security';
  icon = '🔒';
}
