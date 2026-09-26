import { BaseAgent } from '../base-agent.js';
import type { Pillar } from 'agent-ready';

export class DocsAgent extends BaseAgent {
  name = 'Documentation';
  pillar: Pillar = 'docs';
  icon = '📖';
}
