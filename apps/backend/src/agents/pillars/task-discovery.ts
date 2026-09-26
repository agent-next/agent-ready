import { BaseAgent } from '../base-agent.js';
import type { Pillar } from 'agent-ready';

export class TaskDiscoveryAgent extends BaseAgent {
  name = 'Task Discovery';
  pillar: Pillar = 'task_discovery';
  icon = '📋';
}
