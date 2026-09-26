import { BaseAgent } from '../base-agent.js';
import type { Pillar } from 'agent-ready';

export class StyleAgent extends BaseAgent {
  name = 'Style & Validation';
  pillar: Pillar = 'style';
  icon = '✨';
}
