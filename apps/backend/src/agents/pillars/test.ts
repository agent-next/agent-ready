import { BaseAgent } from '../base-agent.js';
import type { Pillar } from 'agent-ready';

export class TestAgent extends BaseAgent {
  name = 'Testing';
  pillar: Pillar = 'test';
  icon = '🧪';
}
