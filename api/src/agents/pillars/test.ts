import { BaseAgent } from '../base-agent.js';
import type { Pillar } from '../../../../src/types.js';

export class TestAgent extends BaseAgent {
  name = 'Testing';
  name_zh = '测试';
  pillar: Pillar = 'test';
  icon = '🧪';
}
