import { BaseAgent } from '../base-agent.js';
import type { Pillar } from '../../../../src/types.js';

export class StyleAgent extends BaseAgent {
  name = 'Style & Validation';
  name_zh = '代码风格';
  pillar: Pillar = 'style';
  icon = '✨';
}
