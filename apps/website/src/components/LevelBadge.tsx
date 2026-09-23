/**
 * Level Badge Component
 *
 * Displays a maturity level badge (L1-L5)
 * Uses generated images from Nano Banana Pro or fallback SVG
 */

import { useState } from 'react';
import { getBadgeUrl } from '../api/images';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const LEVEL_CONFIG: Record<number, { name: string; color: string }> = {
  1: { name: 'Functional', color: '#ef4444' },
  2: { name: 'Documented', color: '#f97316' },
  3: { name: 'Standardized', color: '#eab308' },
  4: { name: 'Optimized', color: '#22c55e' },
  5: { name: 'Autonomous', color: '#3b82f6' },
};

const SIZE_CONFIG = {
  sm: { px: 32, text: 'text-xs' },
  md: { px: 64, text: 'text-sm' },
  lg: { px: 128, text: 'text-base' },
};

export function LevelBadge({
  level,
  size = 'md',
  showLabel = false,
  className = '',
}: LevelBadgeProps) {
  // Track which URL failed to load (instead of boolean) - resets naturally when URL changes
  const [errorUrl, setErrorUrl] = useState<string | null>(null);
  const levelInfo = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];
  const sizeInfo = SIZE_CONFIG[size];

  // Try to load generated image, fallback to SVG badge
  const imageUrl = getBadgeUrl(level, size);

  // Check if the current image URL has errored
  const imageError = errorUrl === imageUrl;

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <div className="relative" style={{ width: sizeInfo.px, height: sizeInfo.px }}>
        {/* Generated image with fallback */}
        {!imageError && (
          <img
            src={imageUrl}
            alt={`Level ${level} Badge`}
            className="w-full h-full object-contain"
            onError={() => setErrorUrl(imageUrl)}
          />
        )}

        {/* Fallback SVG badge */}
        {imageError && (
          <div className="absolute inset-0">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              role="img"
              aria-label={`Level ${level} badge: ${levelInfo.name}`}
            >
              {/* Circle background */}
              <circle cx="50" cy="50" r="45" fill={levelInfo.color} opacity="0.2" />
              <circle cx="50" cy="50" r="45" fill="none" stroke={levelInfo.color} strokeWidth="3" />
              {/* Level text */}
              <text
                x="50"
                y="55"
                textAnchor="middle"
                fill={levelInfo.color}
                fontSize="24"
                fontWeight="bold"
                fontFamily="Inter, sans-serif"
              >
                L{level}
              </text>
              {/* Stars */}
              {Array.from({ length: level }).map((_, i) => (
                <circle key={i} cx={30 + i * 10} cy="75" r="4" fill={levelInfo.color} />
              ))}
            </svg>
          </div>
        )}
      </div>

      {showLabel && (
        <span className={`${sizeInfo.text} font-medium`} style={{ color: levelInfo.color }}>
          {levelInfo.name}
        </span>
      )}
    </div>
  );
}

/**
 * Inline badge for use in text
 */
export function InlineBadge({ level }: { level: number }) {
  const levelInfo = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${levelInfo.color}20`,
        color: levelInfo.color,
        border: `1px solid ${levelInfo.color}40`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: levelInfo.color }} />L
      {level}
    </span>
  );
}
