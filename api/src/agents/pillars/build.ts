import { BaseAgent } from '../base-agent.js';
import type { Pillar } from '../../../../src/types.js';

export class BuildAgent extends BaseAgent {
  name = 'Build System';
  name_zh = '构建系统';
  pillar: Pillar = 'build';
  icon = '🔧';
}
