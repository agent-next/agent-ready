import pg from 'pg';
import { config } from '../config.js';

const { Pool } = pg;

export interface ScanRecord {
  id: string;
  repo_url: string;
  branch?: string;
  profile: string;
  language: 'zh' | 'en';
  status: 'queued' | 'cloning' | 'scanning' | 'completed' | 'failed';
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
  duration_ms?: number;
  result?: unknown;
  error?: string;
}

class DatabaseService {
  private pool: pg.Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: config.databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async createScan(scan: {
    id: string;
    repo_url: string;
    branch?: string;
    profile: string;
    language: 'zh' | 'en';
  }): Promise<ScanRecord> {
    const result = await this.pool.query<ScanRecord>(
      `INSERT INTO scans (id, repo_url, branch, profile, language, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'queued', NOW())
       RETURNING *`,
      [scan.id, scan.repo_url, scan.branch || null, scan.profile, scan.language]
    );
    return result.rows[0];
  }

  async getScan(id: string): Promise<ScanRecord | null> {
    const result = await this.pool.query<ScanRecord>('SELECT * FROM scans WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async updateScanStatus(
    id: string,
    status: ScanRecord['status'],
    extra?: { started_at?: boolean; completed_at?: boolean; error?: string }
  ): Promise<void> {
    const updates: string[] = ['status = $2'];
    const values: unknown[] = [id, status];
    let paramIndex = 3;

    if (extra?.started_at) {
      updates.push(`started_at = NOW()`);
    }
    if (extra?.completed_at) {
      updates.push(`completed_at = NOW()`);
    }
    if (extra?.error !== undefined) {
      updates.push(`error = $${paramIndex}`);
      values.push(extra.error);
      paramIndex++;
    }

    await this.pool.query(`UPDATE scans SET ${updates.join(', ')} WHERE id = $1`, values);
  }

  async completeScan(id: string, result: unknown, durationMs: number): Promise<void> {
    await this.pool.query(
      `UPDATE scans
       SET status = 'completed',
           completed_at = NOW(),
           result = $2,
           duration_ms = $3
       WHERE id = $1`,
      [id, JSON.stringify(result), durationMs]
    );
  }

  async failScan(id: string, error: string, durationMs: number): Promise<void> {
    await this.pool.query(
      `UPDATE scans
       SET status = 'failed',
           completed_at = NOW(),
           error = $2,
           duration_ms = $3
       WHERE id = $1`,
      [id, error, durationMs]
    );
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.pool.query('SELECT 1');
      return { healthy: true, latencyMs: Date.now() - start };
    } catch (error) {
      console.error('[DB] Health check failed:', error);
      return { healthy: false, latencyMs: Date.now() - start };
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Singleton instance
export const db = new DatabaseService();
