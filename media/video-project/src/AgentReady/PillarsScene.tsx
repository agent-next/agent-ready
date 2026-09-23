import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from 'remotion';

function toHexOpacity(value: number): string {
  return Math.round(value).toString(16).padStart(2, '0');
}

const PILLARS = [
  { name: 'Documentation', icon: '📖', color: '#3b82f6' },
  { name: 'Style', icon: '✨', color: '#8b5cf6' },
  { name: 'Build', icon: '🔧', color: '#f59e0b' },
  { name: 'Testing', icon: '🧪', color: '#10b981' },
  { name: 'Security', icon: '🔒', color: '#ef4444' },
  { name: 'Observability', icon: '📊', color: '#06b6d4' },
  { name: 'Environment', icon: '🌍', color: '#84cc16' },
  { name: 'Task Discovery', icon: '📋', color: '#f97316' },
  { name: 'Product', icon: '🚀', color: '#ec4899' },
];

export const PillarsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Animated gradient background
  const gradientShift = Math.sin(frame / 60) * 10;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${135 + gradientShift}deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)`,
        padding: 50,
      }}
    >
      {/* Animated mesh gradient */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: `translate(${Math.sin(frame / 40) * 30}px, ${Math.cos(frame / 50) * 20}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          transform: `translate(${Math.cos(frame / 35) * 25}px, ${Math.sin(frame / 45) * 15}px)`,
        }}
      />
      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          textAlign: 'center',
          marginBottom: 60,
        }}
      >
        <h2
          style={{
            fontSize: 80,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            fontFamily: 'system-ui',
            letterSpacing: '-2px',
            textShadow: '0 0 60px rgba(129, 140, 248, 0.3)',
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
          gap: 24,
          maxWidth: 1600,
          margin: '0 auto',
        }}
      >
        {PILLARS.map((pillar, index) => {
          const delay = index * 5;
          const pillarScale = spring({
            frame: frame - delay - 20,
            fps,
            config: { damping: 12 },
          });

          const pillarOpacity = interpolate(
            frame - delay - 20,
            [0, 15],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          // Wave hover effect
          const waveOffset = Math.sin((frame + index * 10) / 20) * 3;

          // Glow intensity based on animation
          const glowIntensity = interpolate(
            Math.sin((frame + index * 15) / 25),
            [-1, 1],
            [0.3, 0.8]
          );

          return (
            <div
              key={pillar.name}
              style={{
                transform: `scale(${pillarScale}) translateY(${waveOffset}px)`,
                opacity: pillarOpacity,
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)`,
                borderRadius: 20,
                padding: 28,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                border: `2px solid ${pillar.color}60`,
                boxShadow: `0 4px 20px ${pillar.color}${toHexOpacity(glowIntensity * 40)}, inset 0 1px 0 rgba(255,255,255,0.1)`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  width: 72,
                  height: 72,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${pillar.color}20`,
                  borderRadius: 16,
                }}
              >
                {pillar.icon}
              </div>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: 'white',
                  fontFamily: 'system-ui',
                }}
              >
                {pillar.name}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
