import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  random,
} from 'remotion';

// Floating particles for visual interest
const Particle: React.FC<{ index: number; frame: number }> = ({ index, frame }) => {
  const x = random(`x-${index}`) * 100;
  const y = random(`y-${index}`) * 100;
  const size = 2 + random(`size-${index}`) * 4;
  const speed = 0.5 + random(`speed-${index}`) * 1.5;
  const delay = random(`delay-${index}`) * 60;

  const opacity = interpolate(
    frame - delay,
    [0, 30, 60, 90],
    [0, 0.6, 0.6, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const yOffset = ((frame - delay) * speed) % 100;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${(y + yOffset) % 100}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `rgba(129, 140, 248, ${opacity})`,
        boxShadow: `0 0 ${size * 2}px rgba(129, 140, 248, ${opacity * 0.5})`,
      }}
    />
  );
};

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo animation
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  const logoRotation = interpolate(
    spring({ frame, fps, config: { damping: 200 } }),
    [0, 1],
    [-180, 0]
  );

  // Title animation
  const titleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleY = interpolate(
    spring({ frame: frame - 20, fps, config: { damping: 200 } }),
    [0, 1],
    [50, 0]
  );

  // Subtitle animation
  const subtitleOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Glow effect
  const glowOpacity = interpolate(frame, [0, 30, 60], [0, 0.8, 0.4], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Floating particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Particle key={i} index={i} frame={frame} />
      ))}

      {/* Background glow - pulsing */}
      <div
        style={{
          position: 'absolute',
          width: 600 + Math.sin(frame / 15) * 50,
          height: 600 + Math.sin(frame / 15) * 50,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(79, 70, 229, 0.2) 40%, transparent 70%)',
          opacity: glowOpacity,
          filter: 'blur(60px)',
        }}
      />

      {/* Logo - Checkmark in hexagon representing readiness */}
      <div
        style={{
          transform: `scale(${logoScale}) rotate(${logoRotation}deg)`,
          marginBottom: 40,
        }}
      >
        <svg width="200" height="200" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Hexagon shape */}
          <polygon
            points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
            fill="url(#logoGradient)"
            filter="url(#glow)"
          />
          {/* Checkmark */}
          <polyline
            points="28,50 42,65 72,35"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: 'white',
            margin: 0,
            fontFamily: 'system-ui',
            letterSpacing: '-3px',
          }}
        >
          agent-ready
        </h1>
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: subtitleOpacity,
          marginTop: 20,
        }}
      >
        <p
          style={{
            fontSize: 36,
            color: '#a5b4fc',
            margin: 0,
            fontFamily: 'system-ui',
            fontWeight: 500,
          }}
        >
          Make every repo AI-agent ready
        </p>
      </div>
    </AbsoluteFill>
  );
};
