/**
 * Enhanced Levels Scene
 *
 * Uses Nano Banana Pro generated glowing badges instead of CSS
 * Follows Remotion best practices
 */

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from 'remotion';
import { PulsingBadge, AnimatedBackground, GeneratedAssets } from './GeneratedAssets';

const LEVELS = [
  { level: 1 as const, name: 'Functional', desc: 'Code runs, needs manual setup', color: '#ef4444' },
  { level: 2 as const, name: 'Documented', desc: 'Has docs, AGENTS.md, CI basics', color: '#f59e0b' },
  { level: 3 as const, name: 'Standardized', desc: 'Integration tests, observability', color: '#22c55e', current: true },
  { level: 4 as const, name: 'Optimized', desc: 'Fast feedback, deployment frequency', color: '#64748b' },
  { level: 5 as const, name: 'Autonomous', desc: 'Self-improving systems', color: '#3b82f6' },
];

export const LevelsSceneEnhanced: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation - fade in over first 0.66 seconds
  const titleOpacity = interpolate(frame, [0, fps * 0.66], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const titleY = interpolate(
    spring({ frame, fps, config: { damping: 15 } }),
    [0, 1],
    [-30, 0]
  );

  return (
    <AbsoluteFill>
      {/* AI-Generated background */}
      <AnimatedBackground
        src={GeneratedAssets.intro.circuit}
        parallaxSpeed={0.05}
        baseOpacity={0.4}
      />

      {/* Dark overlay for contrast */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15, 15, 35, 0.8) 0%, rgba(26, 26, 62, 0.9) 100%)',
        }}
      />

      {/* Content */}
      <AbsoluteFill style={{ padding: 40 }}>
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textAlign: 'center',
            marginBottom: 40,
          }}
        >
          <h2
            style={{
              fontSize: 72,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #86efac 50%, #22c55e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
              fontFamily: 'system-ui',
              letterSpacing: '-2px',
            }}
          >
            5 Levels of Maturity
          </h2>
        </div>

        {/* Levels with generated badges */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 30,
            marginTop: 20,
          }}
        >
          {LEVELS.map((levelData, index) => {
            const delaySeconds = index * 0.15 + 0.5; // Staggered entrance

            // Progress bar animation
            const barDelay = (index * 0.15 + 0.8) * fps;
            const maxBarHeight = levelData.current ? 200 : 100 + index * 30;
            const barHeight = interpolate(
              spring({ frame: frame - barDelay, fps, config: { damping: 15 } }),
              [0, 1],
              [0, maxBarHeight]
            );

            // Current level indicator
            const currentBadgeOpacity = levelData.current
              ? interpolate(frame, [fps * 1.5, fps * 2], [0, 1], { extrapolateRight: 'clamp' })
              : 0;

            return (
              <div
                key={levelData.level}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: 180,
                }}
              >
                {/* Current level indicator */}
                {levelData.current && (
                  <div
                    style={{
                      background: '#22c55e',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: 10,
                      marginBottom: 8,
                      fontFamily: 'system-ui',
                      opacity: currentBadgeOpacity,
                    }}
                  >
                    CURRENT
                  </div>
                )}

                {/* AI-Generated Pulsing Badge */}
                <PulsingBadge
                  level={levelData.level}
                  size={120}
                  delayInSeconds={delaySeconds}
                />

                {/* Progress bar */}
                <div
                  style={{
                    width: 60,
                    height: 220,
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 30,
                    marginTop: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    overflow: 'hidden',
                    border: levelData.current ? '2px solid #22c55e' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: barHeight,
                      background: `linear-gradient(180deg, ${levelData.color} 0%, ${levelData.color}80 100%)`,
                      borderRadius: 30,
                    }}
                  />
                </div>

                {/* Name */}
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'white',
                    fontFamily: 'system-ui',
                    textAlign: 'center',
                    marginTop: 12,
                  }}
                >
                  {levelData.name}
                </span>

                {/* Description */}
                <span
                  style={{
                    fontSize: 12,
                    color: '#a5b4fc',
                    fontFamily: 'system-ui',
                    textAlign: 'center',
                    marginTop: 6,
                    lineHeight: 1.3,
                  }}
                >
                  {levelData.desc}
                </span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
