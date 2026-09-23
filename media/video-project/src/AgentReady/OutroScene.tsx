import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from 'remotion';

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main content animation
  const contentScale = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  const contentOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Command animation
  const commandOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const commandY = interpolate(
    spring({ frame: frame - 30, fps, config: { damping: 200 } }),
    [0, 1],
    [30, 0]
  );

  // GitHub link animation
  const linkOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Pulsing glow
  const glowScale = interpolate(
    Math.sin(frame / 20),
    [-1, 1],
    [0.9, 1.1]
  );

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
          transform: `scale(${glowScale})`,
          filter: 'blur(80px)',
        }}
      />

      {/* Content */}
      <div
        style={{
          transform: `scale(${contentScale})`,
          opacity: contentOpacity,
          textAlign: 'center',
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: 96,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            fontFamily: 'system-ui',
            marginBottom: 24,
            letterSpacing: '-3px',
          }}
        >
          Get Started Today
        </h2>

        <p
          style={{
            fontSize: 32,
            color: '#a5b4fc',
            margin: 0,
            fontFamily: 'system-ui',
            marginBottom: 60,
          }}
        >
          Make your repository AI-agent ready in seconds
        </p>

        {/* Command */}
        <div
          style={{
            opacity: commandOpacity,
            transform: `translateY(${commandY}px)`,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%)',
              padding: '32px 64px',
              borderRadius: 20,
              border: '3px solid #6366f1',
              boxShadow: `0 0 ${30 + Math.sin(frame / 10) * 15}px rgba(99, 102, 241, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}
          >
            <code
              style={{
                fontSize: 48,
                color: '#22c55e',
                fontFamily: 'monospace',
                fontWeight: 600,
                textShadow: '0 0 30px rgba(34, 197, 94, 0.6)',
              }}
            >
              npx agent-ready scan .
            </code>
          </div>
        </div>

        {/* GitHub */}
        <div style={{ opacity: linkOpacity }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span
              style={{
                fontSize: 36,
                color: 'white',
                fontFamily: 'system-ui',
                fontWeight: 500,
              }}
            >
              github.com/robotlearning123/agent-ready
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
