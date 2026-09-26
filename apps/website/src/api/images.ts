/**
 * Image Generation API Client
 *
 * Uses Nano Banana Pro (Gemini 3 Pro Image) via the backend API
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface OGImageRequest {
  repoName: string;
  level: number | null;
  score: number;
  headline: string;
  pillars?: { name: string; score: number }[];
}

export interface GeneratedImage {
  data: string;
  mimeType: string;
  resolution: string;
  dataUrl: string;
}

/** Discriminated union for image responses - prevents impossible states */
export type ImageResponse =
  | { success: true; image: GeneratedImage }
  | { success: false; error: string };

/**
 * Generate OG image for scan results
 */
export async function generateOGImage(
  request: OGImageRequest,
  options?: { signal?: AbortSignal }
): Promise<ImageResponse> {
  try {
    const response = await fetch(`${API_BASE}/images/og`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: options?.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return response.json();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { success: false, error: 'Request was cancelled' };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

/**
 * Get badge URL for a level
 */
export function getBadgeUrl(level: number, size: 'sm' | 'md' | 'lg' = 'md'): string {
  return `${API_BASE}/images/badge/${level}?size=${size}`;
}

/**
 * Generate hero banner
 */
export async function generateHero(
  theme: 'dark' | 'light',
  title: string,
  subtitle?: string,
  options?: { signal?: AbortSignal }
): Promise<ImageResponse> {
  try {
    const response = await fetch(`${API_BASE}/images/hero`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme, title, subtitle }),
      signal: options?.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return response.json();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { success: false, error: 'Request was cancelled' };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

/**
 * Generate certificate image
 */
export async function generateCertificate(
  params: {
    repoName: string;
    level: number | null;
    score: number;
    pillars: { name: string; level: number | null }[];
  },
  options?: { signal?: AbortSignal }
): Promise<ImageResponse> {
  try {
    const response = await fetch(`${API_BASE}/images/certificate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: options?.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return response.json();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { success: false, error: 'Request was cancelled' };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}
