import { BaseAgent } from '../base-agent.js';
import type { Pillar } from 'agent-ready';

export class ProductAgent extends BaseAgent {
  name = 'Product & Experimentation';
  pillar: Pillar = 'product';
  icon = '🚀';
}
