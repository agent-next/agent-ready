import { useState, useCallback, useEffect, useRef } from 'react';
import { submitScan, getScanStatus } from '../api/scan';
import type { ScanRequest, ScanStatus, ScanResult } from '../api/scan';

interface UseScanOptions {
  pollInterval?: number;
}

interface UseScanReturn {
  status: ScanStatus | null;
  result: ScanResult | null;
  error: string | null;
  isLoading: boolean;
  isPolling: boolean;
  startScan: (repoUrl: string, branch?: string) => Promise<void>;
  reset: () => void;
}

export function useScan(options: UseScanOptions = {}): UseScanReturn {
  const { pollInterval = 2000 } = options;

  const [status, setStatus] = useState<ScanStatus | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const pollTimeoutRef = useRef<number | null>(null);
  const pollGenerationRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollStatusRef = useRef<((scanId: string, generation: number) => Promise<void>) | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  const pollStatus = useCallback(
    async (scanId: string, generation: number) => {
      // Check generation to prevent stale poll callbacks from executing
      if (generation !== pollGenerationRef.current) return;

      // Abort any in-flight request before starting new one (prevents race condition)
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      try {
        const scanStatus = await getScanStatus(scanId, {
          signal: abortControllerRef.current.signal,
        });

        // Check again after async call in case a new scan started
        if (generation !== pollGenerationRef.current) return;

        setStatus(scanStatus);

        if (scanStatus.status === 'completed') {
          // Type narrowing: scanStatus.result is guaranteed to exist when status === 'completed'
          setResult(scanStatus.result);
          setIsPolling(false);
          setIsLoading(false);
        } else if (scanStatus.status === 'failed') {
          // Type narrowing: scanStatus.error is guaranteed to exist when status === 'failed'
          setError(scanStatus.error);
          setIsPolling(false);
          setIsLoading(false);
        } else {
          // Continue polling using ref to avoid closure issues
          pollTimeoutRef.current = window.setTimeout(() => {
            pollStatusRef.current?.(scanId, generation);
          }, pollInterval);
        }
      } catch (err) {
        if (generation !== pollGenerationRef.current) return;
        if (err instanceof Error && err.name === 'AbortError') return;

        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to check scan status: ${message}`);
        setIsPolling(false);
        setIsLoading(false);
      }
    },
    [pollInterval]
  );

  // Keep ref in sync with latest callback
  useEffect(() => {
    pollStatusRef.current = pollStatus;
  }, [pollStatus]);

  const startScan = useCallback(
    async (repoUrl: string, branch?: string) => {
      // Increment generation to invalidate any in-flight polls
      pollGenerationRef.current += 1;
      const currentGeneration = pollGenerationRef.current;

      // Reset state
      setError(null);
      setResult(null);
      setStatus(null);
      setIsLoading(true);

      // Clear any existing poll timeout
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      // Abort any in-flight request before starting new scan
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      try {
        const request: ScanRequest = {
          repo_url: repoUrl,
          branch,
          profile: 'factory_compat',
        };

        const response = await submitScan(request, {
          signal: abortControllerRef.current.signal,
        });

        // Handle case where API returns completed/failed immediately
        if (response.status === 'completed' || response.status === 'failed') {
          setIsPolling(true);
          pollStatus(response.scan_id, currentGeneration);
          return;
        }

        setStatus({
          scan_id: response.scan_id,
          repo_url: repoUrl,
          status: response.status,
          created_at: new Date().toISOString(),
        });

        setIsPolling(true);
        pollTimeoutRef.current = window.setTimeout(() => {
          pollStatus(response.scan_id, currentGeneration);
        }, pollInterval);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to submit scan request: ${message}`);
        setIsLoading(false);
      }
    },
    [pollInterval, pollStatus]
  );

  const reset = useCallback(() => {
    // Increment generation to invalidate any in-flight polls
    pollGenerationRef.current += 1;

    // Clear timeout and abort any in-flight request
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
    }
    abortControllerRef.current?.abort();

    // Reset all state
    setStatus(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
    setIsPolling(false);
  }, []);

  return {
    status,
    result,
    error,
    isLoading,
    isPolling,
    startScan,
    reset,
  };
}
