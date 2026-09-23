import { BaseAgent } from '../base-agent.js';
import type { Pillar } from 'agent-ready';

export class TaskDiscoveryAgent extends BaseAgent {
  name = 'Task Discovery';
  name_zh = '任务发现';
  pillar: Pillar = 'task_discovery';
  icon = '📋';
}
