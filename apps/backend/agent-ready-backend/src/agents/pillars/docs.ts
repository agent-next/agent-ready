import { BaseAgent } from '../base-agent.js';
import type { Pillar } from 'agent-ready';

export class DocsAgent extends BaseAgent {
  name = 'Documentation';
  name_zh = '文档';
  pillar: Pillar = 'docs';
  icon = '📖';
}
