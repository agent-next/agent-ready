/**
 * Outro Scene V2 - Radiant background CTA
 * FIXED: Stronger glow, larger text, more visible background
 */

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from 'remotion';
import { AssetsV2, SubtleBackground } from './GeneratedAssetsV2';

export const OutroSceneV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Exit animation - fade to black
  const exitStart = durationInFrames - 20;
  const exitProgress = interpolate(frame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitOpacity = 1 - exitProgress;
  const exitScale = 1 - exitProgress * 0.05;

  // Content animation
  const contentScale = spring({
    frame,
    fps,
    config: { damping: 12 },
  }) * exitScale;

  const contentOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  }) * exitOpacity;

  // Command animation
  const commandScale = spring({
    frame: frame - 25,
    fps,
    config: { damping: 10 },
  }) * exitScale;

  const commandOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateRight: 'clamp',
  }) * exitOpacity;

  // Link animation
  const linkOpacity = interpolate(frame, [45, 60], [0, 1], {
    extrapolateRight: 'clamp',
  }) * exitOpacity;

  // Strong pulsing glow - synced
  const glowIntensity = (40 + Math.sin(frame / 10) * 20) * exitOpacity;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #151530 50%, #0a0a1a 100%)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Radiant background - very visible */}
      <SubtleBackground src={AssetsV2.outro} opacity={0.6} />

      {/* Center glow overlay */}
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Content */}
      <div
        style={{
          transform: `scale(${contentScale})`,
          opacity: contentOpacity,
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: 110,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            fontFamily: 'system-ui',
            marginBottom: 20,
            letterSpacing: '-4px',
            filter: 'drop-shadow(0 4px 30px rgba(139, 92, 246, 0.5))',
          }}
        >
          Get Ready Today
        </h2>

        <p
          style={{
            fontSize: 40,
            color: 'white',
            margin: 0,
            fontFamily: 'system-ui',
            marginBottom: 50,
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}
        >
          Make your repository AI-agent ready in seconds
        </p>

        {/* Command */}
        <div
          style={{
            transform: `scale(${Math.max(0, commandScale)})`,
            opacity: commandOpacity,
            marginBottom: 50,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(20, 20, 40, 0.9) 100%)',
              padding: '36px 72px',
              borderRadius: 24,
              border: '4px solid #6366f1',
              boxShadow: `0 0 ${glowIntensity}px rgba(99, 102, 241, 0.6), 0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)`,
            }}
          >
            <code
              style={{
                fontSize: 52,
                color: '#22c55e',
                fontFamily: '"SF Mono", "Monaco", monospace',
                fontWeight: 600,
                textShadow: `0 0 ${glowIntensity / 2}px rgba(34, 197, 94, 0.8)`,
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
              gap: 20,
            }}
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="white">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span
              style={{
                fontSize: 40,
                color: 'white',
                fontFamily: 'system-ui',
                fontWeight: 500,
                textShadow: '0 2px 15px rgba(0,0,0,0.5)',
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
