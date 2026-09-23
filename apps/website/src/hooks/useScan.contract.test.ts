import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useScan } from './useScan';
import type { ScanResponse, ScanStatus, ScanResult } from '../api/scan';

// Mock the API functions
vi.mock('../api/scan', () => ({
  submitScan: vi.fn(),
  getScanStatus: vi.fn(),
}));

import { submitScan, getScanStatus } from '../api/scan';

// Helper function to create a mock scan result
function createMockScanResult(): ScanResult {
  return {
    meta: {
      repo: 'test/repo',
      commit: 'abc123',
      timestamp: '2024-01-01T00:00:00Z',
      scan_duration_ms: 1000,
      agents_used: 5,
    },
    executive_summary: {
      level: 3,
      score: 75,
      headline: 'Good progress',
      key_strengths: ['Strong testing'],
      critical_gaps: ['Missing CI'],
      next_steps: ['Add CI pipeline'],
    },
    detailed_analysis: {
      pillars: [],
      cross_pillar_insights: [],
      tech_debt_score: 20,
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
}

describe('useScan - State Machine Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useScan());

      expect(result.current.status).toBe(null);
      expect(result.current.result).toBe(null);
      expect(result.current.error).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isPolling).toBe(false);
      expect(typeof result.current.startScan).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('State Transition: startScan → isLoading = true', () => {
    it('should set isLoading to true when startScan is called', async () => {
      vi.mocked(submitScan).mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep isLoading true
      );

      const { result } = renderHook(() => useScan());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.startScan('https://github.com/test/repo');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });
    });

    it('should clear previous state when startScan is called', async () => {
      vi.mocked(submitScan).mockResolvedValue({
        scan_id: 'scan-123',
        status: 'queued',
        poll_url: '/api/scan/scan-123',
      });

      const { result } = renderHook(() => useScan());

      // Set some initial state
      act(() => {
        result.current.startScan('https://github.com/test/repo');
      });

      await waitFor(() => {
        expect(result.current.isPolling).toBe(true);
      });

      // Start new scan
      act(() => {
        result.current.startScan('https://github.com/test/repo2');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(null);
        expect(result.current.result).toBe(null);
        expect(result.current.status).not.toBe(null);
      });
    });
  });

  describe('State Transition: submitScan success → isPolling = true, status updated', () => {
    it('should set isPolling to true and update status after successful submitScan', async () => {
      const mockResponse: ScanResponse = {
        scan_id: 'scan-123',
        status: 'queued',
        poll_url: '/api/scan/scan-123',
      };

      vi.mocked(submitScan).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useScan());

      act(() => {
        result.current.startScan('https://github.com/test/repo');
      });

      await waitFor(() => {
        expect(result.current.isPolling).toBe(true);
      });

      expect(result.current.status).toMatchObject({
        scan_id: 'scan-123',
        status: 'queued',
      });
    });

    it('should immediately start polling if submitScan returns completed status', async () => {
      const mockResponse: ScanResponse = {
        scan_id: 'scan-123',
        status: 'completed',
        poll_url: '/api/scan/scan-123',
      };

      const mockStatusCompleted: ScanStatus = {
        scan_id: 'scan-123',
        repo_url: 'https://github.com/test/repo',
        status: 'completed',
        created_at: '2024-01-01T00:00:00Z',
        completed_at: '2024-01-01T00:01:00Z',
        result: createMockScanResult(),
      };

      vi.mocked(submitScan).mockResolvedValue(mockResponse);
      vi.mocked(getScanStatus).mockResolvedValue(mockStatusCompleted);

      const { result } = renderHook(() => useScan());

      act(() => {
        result.current.startScan('https://github.com/test/repo');
      });

      // Wait for getScanStatus to be called (polling started immediately)
      await waitFor(() => {
        expect(getScanStatus).toHaveBeenCalled();
      });

      // After polling completes, verify result is set
      await waitFor(() => {
        expect(result.current.result).not.toBe(null);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('State Transition: polling completed → result filled, isLoading/isPolling = false', () => {
    it('should update result and clear loading states when polling returns completed', async () => {
      const mockResponse: ScanResponse = {
        scan_id: 'scan-123',
        status: 'queued',
        poll_url: '/api/scan/scan-123',
      };

      const mockScanResult = createMockScanResult();

      const mockStatusCompleted: ScanStatus = {
        scan_id: 'scan-123',
        repo_url: 'https://github.com/test/repo',
        status: 'completed',
        created_at: '2024-01-01T00:00:00Z',
        completed_at: '2024-01-01T00:01:00Z',
        result: mockScanResult,
      };

      vi.mocked(submitScan).mockResolvedValue(mockResponse);
      vi.mocked(getScanStatus).mockResolvedValue(mockStatusCompleted);

      const { result } = renderHook(() => useScan({ pollInterval: 100 }));

      act(() => {
        result.current.startScan('https://github.com/test/repo');
      });

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
          expect(result.current.isPolling).toBe(false);
          expect(result.current.result).toEqual(mockScanResult);
          expect(result.current.status).toEqual(mockStatusCompleted);
        },
        { timeout: 3000 }
      );
    });

    it('should poll multiple times until status is completed', async () => {
      const mockResponse: ScanResponse = {
        scan_id: 'scan-123',
        status: 'queued',
        poll_url: '/api/scan/scan-123',
      };

      const mockStatusQueued: ScanStatus = {
        scan_id: 'scan-123',
        repo_url: 'https://github.com/test/repo',
        status: 'queued',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockStatusScanning: ScanStatus = {
        scan_id: 'scan-123',
        repo_url: 'https://github.com/test/repo',
        status: 'scanning',
        created_at: '2024-01-01T00:00:00Z',
        progress: 50,
      };

      const mockScanResult = createMockScanResult();

      const mockStatusCompleted: ScanStatus = {
        scan_id: 'scan-123',
        repo_url: 'https://github.com/test/repo',
        status: 'completed',
        created_at: '2024-01-01T00:00:00Z',
        completed_at: '2024-01-01T00:01:00Z',
        result: mockScanResult,
      };

      vi.mocked(submitScan).mockResolvedValue(mockResponse);
      vi.mocked(getScanStatus)
        .mockResolvedValueOnce(mockStatusQueued)
        .mockResolvedValueOnce(mockStatusScanning)
        .mockResolvedValueOnce(mockStatusCompleted);

      const { result } = renderHook(() => useScan({ pollInterval: 50 }));

      act(() => {
        result.current.startScan('https://github.com/test/repo');
      });

      // Wait for all three polls
      await waitFor(
        () => {
          expect(result.current.status?.status).toBe('completed');
          expect(result.current.result).toEqual(mockScanResult);
          expect(result.current.isLoading).toBe(false);
          expect(result.current.isPolling).toBe(false);
        },
        { timeout: 3000 }
      );

      expect(getScanStatus).toHaveBeenCalledTimes(3);
    });
  });

  describe('State Transition: polling failed → error filled, isLoading/isPolling = false', () => {
    it('should set error and clear loading states when polling returns failed', async () => {
      const mockResponse: ScanResponse = {
        scan_id: 'scan-123',
        status: 'queued',
        poll_url: '/api/scan/scan-123',
      };

      const mockStatusFailed: ScanStatus = {
        scan_id: 'scan-123',
        repo_url: 'https://github.com/test/repo',
        status: 'failed',
        created_at: '2024-01-01T00:00:00Z',
        completed_at: '2024-01-01T00:01:00Z',
        error: 'Repository not found',
      };

      vi.mocked(submitScan).mockResolvedValue(mockResponse);
      vi.mocked(getScanStatus).mockResolvedValue(mockStatusFailed);

      const { result } = renderHook(() => useScan({ pollInterval: 50 }));

      act(() => {
        result.current.startScan('https://github.com/test/repo');
      });

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
          expect(result.current.isPolling).toBe(false);
          expect(result.current.error).toBe('Repository not found');
          expect(result.current.status?.status).toBe('failed');
        },
        { timeout: 3000 }
      );
    });

    it('should handle polling network errors', async () => {
      const mockResponse: ScanResponse = {
        scan_id: 'scan-123',
        status: 'queued',
        poll_url: '/api/scan/scan-123',
      };

      vi.mocked(submitScan).mockResolvedValue(mockResponse);
      vi.mocked(getScanStatus).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useScan({ pollInterval: 50 }));

      act(() => {
        result.current.startScan('https://github.com/test/repo');
      });

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
          expect(result.current.isPolling).toBe(false);
          expect(result.current.error).toBe('Failed to check scan status: Network error');
        },
        { timeout: 3000 }
      );
    });
  });

  describe('State Transition: reset → all states cleared', () => {
    it('should reset all state to initial values', async () => {
      const mockResponse: ScanResponse = {
        scan_id: 'scan-123',
        status: 'queued',
        poll_url: '/api/scan/scan-123',
      };

      vi.mocked(submitScan).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useScan());

      act(() => {
        result.current.startScan('https://github.com/test/repo');
      });

      await waitFor(() => {
        expect(result.current.isPolling).toBe(true);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe(null);
      expect(result.current.result).toBe(null);
      expect(result.current.error).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isPolling).toBe(false);
    });

    it('should stop polling after reset', async () => {
      const mockResponse: ScanResponse = {
        scan_id: 'scan-123',
        status: 'queued',
        poll_url: '/api/scan/scan-123',
      };

      const mockStatusQueued: ScanStatus = {
        scan_id: 'scan-123',
        repo_url: 'https://github.com/test/repo',
        status: 'queued',
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(submitScan).mockResolvedValue(mockResponse);
      vi.mocked(getScanStatus).mockResolvedValue(mockStatusQueued);

      const { result } = renderHook(() => useScan({ pollInterval: 50 }));

      act(() => {
        result.current.startScan('https://github.com/test/repo');
      });

      await waitFor(() => {
        expect(getScanStatus).toHaveBeenCalledTimes(1);
      });

      act(() => {
        result.current.reset();
      });

      // Clear mock calls
      vi.mocked(getScanStatus).mockClear();

      // Wait - no more polling should occur
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(getScanStatus).not.toHaveBeenCalled();
    });
  });

  describe('Cancellation Behavior: startScan during startScan → old request cancelled', () => {
    it('should cancel previous request when startScan is called again', async () => {
      const mockResponse1: ScanResponse = {
        scan_id: 'scan-123',
        status: 'queued',
        poll_url: '/api/scan/scan-123',
      };

      const mockResponse2: ScanResponse = {
        scan_id: 'scan-456',
        status: 'queued',
        poll_url: '/api/scan/scan-456',
      };

      let firstCallAborted = false;

      vi.mocked(submitScan)
        .mockImplementationOnce(async (_, options) => {
          return new Promise((resolve, reject) => {
            options?.signal?.addEventListener('abort', () => {
              firstCallAborted = true;
              reject(new DOMException('Aborted', 'AbortError'));
            });
            setTimeout(() => resolve(mockResponse1), 100);
          });
        })
        .mockImplementationOnce(async () => {
          return mockResponse2;
        });

      const { result } = renderHook(() => useScan());

      // Start first scan
      act(() => {
        result.current.startScan('https://github.com/test/repo1');
      });

      // Immediately start second scan
      act(() => {
        result.current.startScan('https://github.com/test/repo2');
      });

      await waitFor(() => {
        expect(firstCallAborted).toBe(true);
        expect(result.current.status?.scan_id).toBe('scan-456');
      });
    });

    it('should not set error state when AbortError occurs during submitScan', async () => {
      const mockResponse2: ScanResponse = {
        scan_id: 'scan-456',
        status: 'queued',
        poll_url: '/api/scan/scan-456',
      };

      vi.mocked(submitScan)
        .mockImplementationOnce(async (_, options) => {
          return new Promise((_resolve, reject) => {
            options?.signal?.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          });
        })
        .mockResolvedValueOnce(mockResponse2);

      const { result } = renderHook(() => useScan());

      act(() => {
        result.current.startScan('https://github.com/test/repo1');
      });

      act(() => {
        result.current.startScan('https://github.com/test/repo2');
      });

      await waitFor(() => {
        expect(result.current.status?.scan_id).toBe('scan-456');
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Cancellation Behavior: unmount → cleanup timeout and abort', () => {
    it('should cleanup timeout on unmount', async () => {
      const mockResponse: ScanResponse = {
        scan_id: 'scan-123',
        status: 'queued',
        poll_url: '/api/scan/scan-123',
      };

      const mockStatusQueued: ScanStatus = {
        scan_id: 'scan-123',
        repo_url: 'https://github.com/test/repo',
        status: 'queued',
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(submitScan).mockResolvedValue(mockResponse);
      vi.mocked(getScanStatus).mockResolvedValue(mockStatusQueued);

      const { result, unmount } = renderHook(() => useScan({ pollInterval: 50 }));

      act(() => {
        result.current.startScan('https://github.com/test/repo');
      });

      await waitFor(() => {
        expect(getScanStatus).toHaveBeenCalled();
      });

      unmount();

      // Clear mocks
      vi.mocked(getScanStatus).mockClear();

      // Wait - should not poll after unmount
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(getScanStatus).not.toHaveBeenCalled();
    });

    it('should abort ongoing request on unmount', async () => {
      let abortCalled = false;

      vi.mocked(submitScan).mockImplementationOnce(async (_, options) => {
        return new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => {
            abortCalled = true;
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      });

      const { result, unmount } = renderHook(() => useScan());

      act(() => {
        result.current.startScan('https://github.com/test/repo');
      });

      unmount();

      await waitFor(() => {
        expect(abortCalled).toBe(true);
      });
    });
  });

  describe('Boundary Case: expired polling responses ignored (generation check)', () => {
    it('should ignore polling responses from old generation', async () => {
      const mockResponse1: ScanResponse = {
        scan_id: 'scan-123',
        status: 'queued',
        poll_url: '/api/scan/scan-123',
      };

      const mockResponse2: ScanResponse = {
        scan_id: 'scan-456',
        status: 'queued',
        poll_url: '/api/scan/scan-456',
      };

      const mockStatus2: ScanStatus = {
        scan_id: 'scan-456',
        repo_url: 'https://github.com/test/repo2',
        status: 'scanning',
        created_at: '2024-01-01T00:00:00Z',
        progress: 50,
      };

      vi.mocked(submitScan)
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      vi.mocked(getScanStatus).mockResolvedValue(mockStatus2);

      const { result } = renderHook(() => useScan({ pollInterval: 50 }));

      // Start first scan
      act(() => {
        result.current.startScan('https://github.com/test/repo1');
      });

      // Start second scan immediately (cancels first)
      act(() => {
        result.current.startScan('https://github.com/test/repo2');
      });

      await waitFor(() => {
        // Should only see status from second scan
        expect(result.current.status?.scan_id).toBe('scan-456');
        expect(result.current.status?.status).toBe('scanning');
      });

      // The first scan's polling result should be ignored
      expect(result.current.status?.repo_url).toBe('https://github.com/test/repo2');
    });

    it('should cancel previous poll when starting new scan', async () => {
      const mockResponse1: ScanResponse = {
        scan_id: 'scan-123',
        status: 'queued',
        poll_url: '/api/scan/scan-123',
      };

      const mockResponse2: ScanResponse = {
        scan_id: 'scan-456',
        status: 'queued',
        poll_url: '/api/scan/scan-456',
      };

      const mockStatus1: ScanStatus = {
        scan_id: 'scan-123',
        repo_url: 'https://github.com/test/repo1',
        status: 'scanning',
        created_at: '2024-01-01T00:00:00Z',
        progress: 50,
      };

      const mockStatus2: ScanStatus = {
        scan_id: 'scan-456',
        repo_url: 'https://github.com/test/repo2',
        status: 'queued',
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(submitScan)
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      vi.mocked(getScanStatus).mockResolvedValueOnce(mockStatus1).mockResolvedValue(mockStatus2);

      const { result } = renderHook(() => useScan({ pollInterval: 50 }));

      // Start first scan
      act(() => {
        result.current.startScan('https://github.com/test/repo1');
      });

      //Wait for first poll
      await waitFor(() => {
        expect(result.current.status?.scan_id).toBe('scan-123');
      });

      // Start second scan (should cancel first and use new generation)
      act(() => {
        result.current.startScan('https://github.com/test/repo2');
      });

      // Verify second scan status is set
      await waitFor(() => {
        expect(result.current.status?.scan_id).toBe('scan-456');
      });

      // Ensure we're polling for the new scan, not the old one
      expect(result.current.status?.repo_url).toBe('https://github.com/test/repo2');
    });
  });

  describe('Boundary Case: AbortError does not set error state', () => {
    it('should not set error when polling is aborted', async () => {
      const mockResponse: ScanResponse = {
        scan_id: 'scan-123',
        status: 'queued',
        poll_url: '/api/scan/scan-123',
      };

      const mockResponse2: ScanResponse = {
        scan_id: 'scan-456',
        status: 'queued',
        poll_url: '/api/scan/scan-456',
      };

      vi.mocked(submitScan)
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce(mockResponse2);

      vi.mocked(getScanStatus).mockImplementationOnce(async (_, options) => {
        return new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      });

      const { result } = renderHook(() => useScan({ pollInterval: 50 }));

      act(() => {
        result.current.startScan('https://github.com/test/repo');
      });

      // Cancel by starting new scan
      act(() => {
        result.current.startScan('https://github.com/test/repo2');
      });

      await waitFor(() => {
        expect(result.current.status?.scan_id).toBe('scan-456');
      });

      expect(result.current.error).toBe(null);
    });

    it('should not set error when submitScan is aborted', async () => {
      const mockResponse2: ScanResponse = {
        scan_id: 'scan-456',
        status: 'queued',
        poll_url: '/api/scan/scan-456',
      };

      vi.mocked(submitScan)
        .mockImplementationOnce(async (_, options) => {
          return new Promise((_resolve, reject) => {
            options?.signal?.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          });
        })
        .mockResolvedValueOnce(mockResponse2);

      const { result } = renderHook(() => useScan());

      act(() => {
        result.current.startScan('https://github.com/test/repo1');
      });

      // Cancel by starting new scan
      act(() => {
        result.current.startScan('https://github.com/test/repo2');
      });

      await waitFor(() => {
        expect(result.current.status?.scan_id).toBe('scan-456');
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Edge Cases', () => {
    it('should handle non-Error objects in catch blocks', async () => {
      vi.mocked(submitScan).mockRejectedValue('String error');

      const { result } = renderHook(() => useScan());

      act(() => {
        result.current.startScan('https://github.com/test/repo');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to submit scan request: Unknown error');
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle custom pollInterval option', async () => {
      const mockResponse: ScanResponse = {
        scan_id: 'scan-123',
        status: 'queued',
        poll_url: '/api/scan/scan-123',
      };

      const mockStatusQueued: ScanStatus = {
        scan_id: 'scan-123',
        repo_url: 'https://github.com/test/repo',
        status: 'queued',
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(submitScan).mockResolvedValue(mockResponse);
      vi.mocked(getScanStatus).mockResolvedValue(mockStatusQueued);

      const { result } = renderHook(() => useScan({ pollInterval: 100 }));

      act(() => {
        result.current.startScan('https://github.com/test/repo');
      });

      await waitFor(() => {
        expect(getScanStatus).toHaveBeenCalledTimes(1);
      });

      vi.mocked(getScanStatus).mockClear();

      await new Promise((resolve) => setTimeout(resolve, 150));

      await waitFor(() => {
        expect(getScanStatus).toHaveBeenCalled();
      });
    });

    it('should pass branch parameter to submitScan', async () => {
      const mockResponse: ScanResponse = {
        scan_id: 'scan-123',
        status: 'queued',
        poll_url: '/api/scan/scan-123',
      };

      vi.mocked(submitScan).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useScan());

      act(() => {
        result.current.startScan('https://github.com/test/repo', 'develop');
      });

      await waitFor(() => {
        expect(submitScan).toHaveBeenCalledWith(
          {
            repo_url: 'https://github.com/test/repo',
            branch: 'develop',
            profile: 'factory_compat',
          },
          expect.objectContaining({ signal: expect.any(AbortSignal) })
        );
      });
    });
  });
});
