/**
 * Enhanced Pillars Scene
 *
 * Uses Nano Banana Pro generated pillar icons instead of emojis
 * Following Remotion best practices
 */

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Img,
} from 'remotion';
import { AnimatedBackground, GeneratedAssets } from './GeneratedAssets';

const PILLARS: Array<{
  name: string;
  pillar: keyof typeof GeneratedAssets.pillars;
  color: string;
}> = [
  { name: 'Documentation', pillar: 'documentation', color: '#3b82f6' },
  { name: 'Code Style', pillar: 'codeStyle', color: '#8b5cf6' },
  { name: 'Build System', pillar: 'build', color: '#f59e0b' },
  { name: 'Testing', pillar: 'testing', color: '#10b981' },
  { name: 'Security', pillar: 'security', color: '#ef4444' },
  { name: 'Observability', pillar: 'observability', color: '#06b6d4' },
  { name: 'Environment', pillar: 'environment', color: '#84cc16' },
  { name: 'Task Discovery', pillar: 'taskDiscovery', color: '#f97316' },
  { name: 'Product', pillar: 'product', color: '#ec4899' },
];

export const PillarsSceneEnhanced: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation - fade in over 0.5 seconds
  const titleOpacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const titleY = interpolate(
    spring({ frame, fps, config: { damping: 200 } }),
    [0, 1],
    [-40, 0]
  );

  return (
    <AbsoluteFill>
      {/* AI-Generated background */}
      <AnimatedBackground
        src={GeneratedAssets.intro.neural}
        parallaxSpeed={0.03}
        baseOpacity={0.5}
      />

      {/* Dark overlay for contrast */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.85) 0%, rgba(26, 26, 62, 0.9) 100%)',
        }}
      />

      {/* Content */}
      <AbsoluteFill style={{ padding: 50 }}>
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textAlign: 'center',
            marginBottom: 50,
          }}
        >
          <h2
            style={{
              fontSize: 72,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
              fontFamily: 'system-ui',
              letterSpacing: '-2px',
            }}
          >
            9 Pillars of Readiness
          </h2>
        </div>

        {/* Pillars Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          {PILLARS.map((pillarData, index) => {
            // Staggered entrance: 0.5s base + 0.1s per item
            const delaySeconds = 0.5 + index * 0.1;
            const delayFrames = delaySeconds * fps;
            const adjustedFrame = Math.max(0, frame - delayFrames);

            // Pop-in animation (0.4 seconds)
            const entranceScale = spring({
              frame: adjustedFrame,
              fps,
              config: { damping: 12 },
            });

            // Floating effect
            const floatCycle = (adjustedFrame / fps) * Math.PI * 2;
            const floatOffset = Math.sin(floatCycle + index * 0.5) * 3;

            // Glow pulse
            const glowCycle = (adjustedFrame / fps) * Math.PI * 3;
            const glowIntensity = interpolate(
              Math.sin(glowCycle + index * 0.3),
              [-1, 1],
              [0.3, 0.8]
            );

            return (
              <div
                key={pillarData.name}
                style={{
                  transform: `scale(${entranceScale}) translateY(${floatOffset}px)`,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  borderRadius: 16,
                  padding: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  border: `2px solid ${pillarData.color}60`,
                  boxShadow: `0 4px 20px rgba(0, 0, 0, 0.3), 0 0 ${20 * glowIntensity}px ${pillarData.color}40`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                {/* AI-Generated pillar icon */}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 12,
                    overflow: 'hidden',
                    flexShrink: 0,
                    filter: `drop-shadow(0 0 ${5 * glowIntensity}px ${pillarData.color})`,
                  }}
                >
                  <Img
                    src={GeneratedAssets.pillars[pillarData.pillar]}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>

                {/* Name */}
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: 'white',
                    fontFamily: 'system-ui',
                  }}
                >
                  {pillarData.name}
                </span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
