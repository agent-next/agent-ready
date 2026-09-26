import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from 'remotion';

const LEVELS = [
  { level: 'L1', name: 'Functional', desc: 'Code runs, needs manual setup', color: '#ef4444', achieved: true },
  { level: 'L2', name: 'Documented', desc: 'Has docs, AGENTS.md, CI basics', color: '#f59e0b', achieved: true },
  { level: 'L3', name: 'Standardized', desc: 'Integration tests, observability', color: '#22c55e', achieved: true, current: true },
  { level: 'L4', name: 'Optimized', desc: 'Fast feedback, deployment frequency', color: '#64748b', achieved: false },
  { level: 'L5', name: 'Autonomous', desc: 'Self-improving systems', color: '#64748b', achieved: false },
];

export const LevelsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Animated background
  const bgShift = Math.sin(frame / 50) * 5;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${180 + bgShift}deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)`,
        padding: 40,
        justifyContent: 'center',
      }}
    >
      {/* Animated orb */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 60%)',
          filter: 'blur(100px)',
          transform: `translate(-50%, -50%) scale(${1 + Math.sin(frame / 30) * 0.1})`,
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

      {/* Levels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 40,
          flexWrap: 'wrap',
        }}
      >
        {LEVELS.map((level, index) => {
          const delay = index * 8;
          const scaleProgress = spring({
            frame: frame - delay - 15,
            fps,
            config: { damping: 12 },
          });

          // Different bar heights based on level
          const maxBarHeight = level.achieved ? 100 + index * 45 : 60;
          const barHeight = interpolate(
            spring({ frame: frame - delay - 25, fps, config: { damping: 15 } }),
            [0, 1],
            [0, maxBarHeight]
          );

          // Pulsing effect for current level
          const pulseScale = level.current
            ? 1 + Math.sin(frame / 8) * 0.03
            : 1;

          return (
            <div
              key={level.level}
              style={{
                transform: `scale(${scaleProgress * pulseScale})`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 200,
              }}
            >
              {/* Current level indicator */}
              {level.current && (
                <div
                  style={{
                    background: '#22c55e',
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 700,
                    padding: '6px 16px',
                    borderRadius: 12,
                    marginBottom: 12,
                    fontFamily: 'system-ui',
                  }}
                >
                  CURRENT
                </div>
              )}

              {/* Bar */}
              <div
                style={{
                  width: 100,
                  height: 340,
                  background: level.achieved ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  overflow: 'hidden',
                  marginBottom: 24,
                  border: level.current ? '3px solid #22c55e' : 'none',
                  boxShadow: level.current ? '0 0 20px rgba(34, 197, 94, 0.4)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: barHeight,
                    background: level.achieved
                      ? `linear-gradient(180deg, ${level.color} 0%, ${level.color}80 100%)`
                      : 'linear-gradient(180deg, #64748b40 0%, #64748b20 100%)',
                    borderRadius: 50,
                  }}
                />
              </div>

              {/* Level badge */}
              <div
                style={{
                  background: level.achieved ? level.color : '#374151',
                  color: 'white',
                  fontSize: 32,
                  fontWeight: 800,
                  padding: '10px 28px',
                  borderRadius: 24,
                  marginBottom: 16,
                  fontFamily: 'system-ui',
                  opacity: level.achieved ? 1 : 0.6,
                }}
              >
                {level.level}
              </div>

              {/* Name */}
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: level.achieved ? 'white' : '#6b7280',
                  fontFamily: 'system-ui',
                  textAlign: 'center',
                }}
              >
                {level.name}
              </span>

              {/* Description */}
              <span
                style={{
                  fontSize: 14,
                  color: level.achieved ? '#a5b4fc' : '#6b7280',
                  fontFamily: 'system-ui',
                  textAlign: 'center',
                  marginTop: 10,
                  lineHeight: 1.4,
                }}
              >
                {level.desc}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
