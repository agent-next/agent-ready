import { BaseAgent } from '../base-agent.js';
import type { Pillar } from 'agent-ready';

export class TestAgent extends BaseAgent {
  name = 'Testing';
  name_zh = '测试';
  pillar: Pillar = 'test';
  icon = '🧪';
}
