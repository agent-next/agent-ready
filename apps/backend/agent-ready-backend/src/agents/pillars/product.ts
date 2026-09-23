import { BaseAgent } from '../base-agent.js';
import type { Pillar } from 'agent-ready';

export class ProductAgent extends BaseAgent {
  name = 'Product & Experimentation';
  name_zh = '产品';
  pillar: Pillar = 'product';
  icon = '🚀';
}
