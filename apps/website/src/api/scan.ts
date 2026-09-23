// API client for scan endpoints

export const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface ScanRequest {
  repo_url: string;
  branch?: string;
  profile?: string;
}

export interface ScanResponse {
  scan_id: string;
  status: 'queued' | 'cloning' | 'scanning' | 'completed' | 'failed';
  poll_url: string;
}

/** Base fields present in all scan status states */
interface ScanStatusBase {
  scan_id: string;
  repo_url: string;
  created_at: string;
  started_at?: string;
  duration_ms?: number;
}

interface ScanStatusInProgress extends ScanStatusBase {
  status: 'queued' | 'cloning' | 'scanning';
  progress?: number;
}

interface ScanStatusCompleted extends ScanStatusBase {
  status: 'completed';
  completed_at: string;
  result: ScanResult;
}

interface ScanStatusFailed extends ScanStatusBase {
  status: 'failed';
  completed_at: string;
  error: string;
}

/** Discriminated union for scan status - prevents impossible states */
export type ScanStatus = ScanStatusInProgress | ScanStatusCompleted | ScanStatusFailed;

export interface PillarResult {
  pillar: string;
  level_achieved: number | null;
  score: number;
  icon: string;
  name: string;
  checks_passed: number;
  checks_total: number;
}

export interface CheckResult {
  id: string;
  name: string;
  passed: boolean;
  level: number;
  message?: string;
  fix?: string;
}

export interface ScanResult {
  meta: {
    repo: string;
    commit: string;
    timestamp: string;
    scan_duration_ms: number;
    agents_used: number;
  };
  executive_summary: {
    level: number | null;
    score: number;
    headline: string;
    key_strengths: string[];
    critical_gaps: string[];
    next_steps: string[];
  };
  detailed_analysis: {
    pillars: PillarResult[];
    cross_pillar_insights: Array<{
      type: 'risk' | 'opportunity' | 'strength';
      pillars: string[];
      insight: string;
      recommendation: string;
    }>;
    tech_debt_score: number;
  };
  improvement_roadmap: ImprovementRoadmap;
  charts: {
    pillar_radar: { pillar: string; score: number }[];
    level_progress: { level: number; achieved: boolean; score: number }[];
  };
}

export interface ActionItem {
  pillar: string;
  action: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}

export interface ImprovementRoadmap {
  quick_wins: ActionItem[];
  short_term: ActionItem[];
  medium_term: ActionItem[];
  long_term: ActionItem[];
}

export async function submitScan(
  request: ScanRequest,
  options?: { signal?: AbortSignal }
): Promise<ScanResponse> {
  try {
    const response = await fetch(`${API_BASE}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Failed to submit scan');
    }

    return response.json();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw err;
    }
    throw err;
  }
}

export async function getScanStatus(
  scanId: string,
  options?: { signal?: AbortSignal }
): Promise<ScanStatus> {
  try {
    const response = await fetch(`${API_BASE}/scan/${scanId}`, {
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Failed to get scan status');
    }

    return response.json();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw err;
    }
    throw err;
  }
}
