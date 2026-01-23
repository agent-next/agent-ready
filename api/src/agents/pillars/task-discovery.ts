import { BaseAgent } from '../base-agent.js';
import type { Pillar } from '../../../../src/types.js';

export class TaskDiscoveryAgent extends BaseAgent {
  name = 'Task Discovery';
  name_zh = '任务发现';
  pillar: Pillar = 'task_discovery';
  icon = '📋';
}
