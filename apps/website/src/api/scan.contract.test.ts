import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  submitScan,
  getScanStatus,
  type ScanRequest,
  type ScanResponse,
  type ScanStatus,
  type ScanResult,
} from './scan';

describe('scan API contract tests', () => {
  // Store original fetch
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Reset fetch mock before each test
    vi.resetAllMocks();
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  describe('submitScan', () => {
    it('returns ScanResponse format on success', async () => {
      // Arrange
      const mockResponse: ScanResponse = {
        scan_id: 'scan_123',
        status: 'queued',
        poll_url: '/api/scan/scan_123',
      };

      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );
      global.fetch = mockFetch;

      const request: ScanRequest = {
        repo_url: 'https://github.com/user/repo',
        branch: 'main',
        profile: 'default',
      };

      // Act
      const result = await submitScan(request);

      // Assert - verify response contract
      expect(result).toEqual(mockResponse);
      expect(result.scan_id).toBe('scan_123');
      expect(result.status).toBe('queued');
      expect(result.poll_url).toBe('/api/scan/scan_123');

      // Assert - verify request contract
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/scan'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        })
      );
    });

    it('throws Error on network error', async () => {
      // Arrange
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Internal server error' }),
        } as Response)
      );
      global.fetch = mockFetch;

      const request: ScanRequest = {
        repo_url: 'https://github.com/user/repo',
      };

      // Act & Assert
      await expect(submitScan(request)).rejects.toThrow('Internal server error');
    });

    it('parses error field from HTTP error response', async () => {
      // Arrange
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: 'Invalid repository URL' }),
        } as Response)
      );
      global.fetch = mockFetch;

      const request: ScanRequest = {
        repo_url: 'invalid-url',
      };

      // Act & Assert
      await expect(submitScan(request)).rejects.toThrow('Invalid repository URL');
    });

    it('handles malformed error response gracefully', async () => {
      // Arrange
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.reject(new Error('Invalid JSON')),
        } as Response)
      );
      global.fetch = mockFetch;

      const request: ScanRequest = {
        repo_url: 'https://github.com/user/repo',
      };

      // Act & Assert
      await expect(submitScan(request)).rejects.toThrow('Network error');
    });

    it('propagates AbortError correctly', async () => {
      // Arrange
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';

      const mockFetch = vi.fn(() => Promise.reject(abortError));
      global.fetch = mockFetch;

      const request: ScanRequest = {
        repo_url: 'https://github.com/user/repo',
      };
      const controller = new AbortController();
      controller.abort();

      // Act & Assert
      await expect(submitScan(request, { signal: controller.signal })).rejects.toThrow(abortError);
      await expect(submitScan(request, { signal: controller.signal })).rejects.toHaveProperty(
        'name',
        'AbortError'
      );
    });

    it('passes AbortSignal to fetch', async () => {
      // Arrange
      const mockResponse: ScanResponse = {
        scan_id: 'scan_123',
        status: 'queued',
        poll_url: '/api/scan/scan_123',
      };

      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );
      global.fetch = mockFetch;

      const request: ScanRequest = {
        repo_url: 'https://github.com/user/repo',
      };
      const controller = new AbortController();

      // Act
      await submitScan(request, { signal: controller.signal });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: controller.signal,
        })
      );
    });
  });

  describe('getScanStatus', () => {
    it('returns ScanStatus format on success', async () => {
      // Arrange
      const mockStatus: ScanStatus = {
        scan_id: 'scan_123',
        repo_url: 'https://github.com/user/repo',
        status: 'queued',
        created_at: '2024-01-01T00:00:00Z',
        progress: 0,
      };

      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStatus),
        } as Response)
      );
      global.fetch = mockFetch;

      // Act
      const result = await getScanStatus('scan_123');

      // Assert - verify response contract
      expect(result).toEqual(mockStatus);
      expect(result.scan_id).toBe('scan_123');
      expect(result.status).toBe('queued');

      // Assert - verify request contract
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/scan/scan_123'),
        expect.objectContaining({})
      );
    });

    it('handles completed status with result', async () => {
      // Arrange
      const mockResult: ScanResult = {
        meta: {
          repo: 'user/repo',
          commit: 'abc123',
          timestamp: '2024-01-01T00:00:00Z',
          scan_duration_ms: 5000,
          agents_used: 3,
        },
        executive_summary: {
          level: 2,
          score: 75,
          headline: 'Good progress',
          key_strengths: ['CI/CD'],
          critical_gaps: ['Testing'],
          next_steps: ['Add tests'],
        },
        detailed_analysis: {
          pillars: [],
          cross_pillar_insights: [],
          tech_debt_score: 30,
        },
        improvement_roadmap: {
          quick_wins: [],
          short_term: [],
          medium_term: [],
          long_term: [],
        },
        charts: {
          pillar_radar: [],
          level_progress: [],
        },
      };

      const mockStatus: ScanStatus = {
        scan_id: 'scan_123',
        repo_url: 'https://github.com/user/repo',
        status: 'completed',
        created_at: '2024-01-01T00:00:00Z',
        started_at: '2024-01-01T00:00:10Z',
        completed_at: '2024-01-01T00:01:00Z',
        duration_ms: 50000,
        result: mockResult,
      };

      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStatus),
        } as Response)
      );
      global.fetch = mockFetch;

      // Act
      const result = await getScanStatus('scan_123');

      // Assert - verify completed status contract
      expect(result.status).toBe('completed');
      if (result.status === 'completed') {
        expect(result.result).toBeDefined();
        expect(result.result.meta).toBeDefined();
        expect(result.result.executive_summary).toBeDefined();
        expect(result.completed_at).toBeDefined();
      }
    });

    it('handles failed status with error', async () => {
      // Arrange
      const mockStatus: ScanStatus = {
        scan_id: 'scan_123',
        repo_url: 'https://github.com/user/repo',
        status: 'failed',
        created_at: '2024-01-01T00:00:00Z',
        started_at: '2024-01-01T00:00:10Z',
        completed_at: '2024-01-01T00:00:30Z',
        duration_ms: 20000,
        error: 'Repository not accessible',
      };

      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStatus),
        } as Response)
      );
      global.fetch = mockFetch;

      // Act
      const result = await getScanStatus('scan_123');

      // Assert - verify failed status contract
      expect(result.status).toBe('failed');
      if (result.status === 'failed') {
        expect(result.error).toBe('Repository not accessible');
        expect(result.completed_at).toBeDefined();
      }
    });

    it('handles in-progress status', async () => {
      // Arrange
      const mockStatus: ScanStatus = {
        scan_id: 'scan_123',
        repo_url: 'https://github.com/user/repo',
        status: 'scanning',
        created_at: '2024-01-01T00:00:00Z',
        started_at: '2024-01-01T00:00:10Z',
        progress: 45,
      };

      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStatus),
        } as Response)
      );
      global.fetch = mockFetch;

      // Act
      const result = await getScanStatus('scan_123');

      // Assert - verify in-progress status contract
      expect(result.status).toBe('scanning');
      if (
        result.status === 'queued' ||
        result.status === 'cloning' ||
        result.status === 'scanning'
      ) {
        expect(result.progress).toBe(45);
      }
    });

    it('propagates AbortError correctly', async () => {
      // Arrange
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';

      const mockFetch = vi.fn(() => Promise.reject(abortError));
      global.fetch = mockFetch;

      const controller = new AbortController();
      controller.abort();

      // Act & Assert
      await expect(getScanStatus('scan_123', { signal: controller.signal })).rejects.toThrow(
        abortError
      );
      await expect(getScanStatus('scan_123', { signal: controller.signal })).rejects.toHaveProperty(
        'name',
        'AbortError'
      );
    });

    it('throws Error on HTTP error', async () => {
      // Arrange
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ error: 'Scan not found' }),
        } as Response)
      );
      global.fetch = mockFetch;

      // Act & Assert
      await expect(getScanStatus('scan_123')).rejects.toThrow('Scan not found');
    });

    it('handles malformed error response gracefully', async () => {
      // Arrange
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.reject(new Error('Invalid JSON')),
        } as Response)
      );
      global.fetch = mockFetch;

      // Act & Assert
      await expect(getScanStatus('scan_123')).rejects.toThrow('Network error');
    });

    it('passes AbortSignal to fetch', async () => {
      // Arrange
      const mockStatus: ScanStatus = {
        scan_id: 'scan_123',
        repo_url: 'https://github.com/user/repo',
        status: 'queued',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStatus),
        } as Response)
      );
      global.fetch = mockFetch;

      const controller = new AbortController();

      // Act
      await getScanStatus('scan_123', { signal: controller.signal });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: controller.signal,
        })
      );
    });
  });
});
