/**
 * Enhanced Outro Scene
 *
 * Call to action with AI-generated background
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
import { GeneratedAssets, PulsingBadge } from './GeneratedAssets';

export const OutroSceneEnhanced: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background fade in
  const bgOpacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Title animation
  const titleScale = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  // Subtitle fade
  const subtitleOpacity = interpolate(frame, [0.5 * fps, 1 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // CTA button animation
  const ctaScale = spring({
    frame: frame - 1 * fps,
    fps,
    config: { damping: 8 }, // Bouncy
  });

  // Badge entrance
  const badgeOpacity = interpolate(frame, [1.2 * fps, 1.7 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Glow pulse
  const glowCycle = (frame / fps) * Math.PI * 2;
  const glowIntensity = 20 + Math.sin(glowCycle) * 10;

  return (
    <AbsoluteFill>
      {/* AI-Generated CTA background */}
      <div style={{ position: 'absolute', inset: 0, opacity: bgOpacity }}>
        <Img
          src={GeneratedAssets.outro.ctaBackground}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Dark overlay for better text visibility */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15, 15, 35, 0.6) 0%, rgba(15, 15, 35, 0.8) 100%)',
        }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Badge */}
        <div style={{ opacity: badgeOpacity, marginBottom: 30 }}>
          <PulsingBadge level={5} size={120} delayInSeconds={0} />
        </div>

        {/* Title */}
        <div
          style={{
            transform: `scale(${titleScale})`,
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: 'white',
              margin: 0,
              fontFamily: 'system-ui',
              letterSpacing: '-2px',
              textShadow: `0 0 ${glowIntensity}px rgba(99, 102, 241, 0.5)`,
            }}
          >
            Get Started
          </h2>
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: subtitleOpacity,
            marginTop: 20,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: 32,
              color: '#a5b4fc',
              margin: 0,
              fontFamily: 'system-ui',
              fontWeight: 500,
            }}
          >
            Make your repo AI-agent ready today
          </p>
        </div>

        {/* CTA Button */}
        <div
          style={{
            transform: `scale(${Math.max(0, ctaScale)})`,
            marginTop: 50,
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              padding: '20px 50px',
              borderRadius: 16,
              boxShadow: `0 10px 40px rgba(99, 102, 241, 0.4), 0 0 ${glowIntensity}px rgba(99, 102, 241, 0.3)`,
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: 'white',
                fontFamily: 'monospace',
              }}
            >
              npx agent-ready scan .
            </span>
          </div>
        </div>

        {/* Footer links */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            gap: 40,
            opacity: subtitleOpacity,
          }}
        >
          <span style={{ color: '#6b7280', fontSize: 20, fontFamily: 'system-ui' }}>
            github.com/robotlearning123/agent-ready
          </span>
          <span style={{ color: '#6b7280', fontSize: 20, fontFamily: 'system-ui' }}>
            agent-ready.dev
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
