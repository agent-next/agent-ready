import { BaseAgent } from '../base-agent.js';
import type { Pillar } from 'agent-ready';

export class EnvironmentAgent extends BaseAgent {
  name = 'Development Environment';
  pillar: Pillar = 'env';
  icon = '🌍';
}
