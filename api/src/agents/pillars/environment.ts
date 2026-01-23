import { BaseAgent } from '../base-agent.js';
import type { Pillar } from '../../../../src/types.js';

export class EnvironmentAgent extends BaseAgent {
  name = 'Development Environment';
  name_zh = '开发环境';
  pillar: Pillar = 'env';
  icon = '🌍';
}
