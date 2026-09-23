/**
 * Enhanced Intro Scene
 *
 * Uses Nano Banana Pro generated backgrounds instead of CSS gradients
 * Follows Remotion best practices:
 * - <Img> component for all images
 * - staticFile() for public assets
 * - All animations driven by useCurrentFrame()
 */

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from 'remotion';
import { GeneratedAssets, CrossfadeBackgrounds } from './GeneratedAssets';

export const IntroSceneEnhanced: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo animation - entrance over 0.5 seconds
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

  // Title animation - fade in from 0.66s to 1.33s
  const titleOpacity = interpolate(frame, [fps * 0.66, fps * 1.33], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleY = interpolate(
    spring({ frame: frame - fps * 0.66, fps, config: { damping: 200 } }),
    [0, 1],
    [50, 0]
  );

  // Subtitle animation - fade in from 1.33s to 2s
  const subtitleOpacity = interpolate(frame, [fps * 1.33, fps * 2], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Background glow overlay pulse
  const glowCycle = (frame / fps) * Math.PI * 0.5;
  const glowOpacity = 0.4 + Math.sin(glowCycle) * 0.2;

  return (
    <AbsoluteFill>
      {/* AI-Generated backgrounds with crossfade */}
      <CrossfadeBackgrounds
        sources={[
          GeneratedAssets.intro.space,
          GeneratedAssets.intro.circuit,
          GeneratedAssets.intro.neural,
        ]}
        durationInSeconds={1}
      />

      {/* Overlay gradient for better text contrast */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 0%, rgba(15, 15, 35, 0.7) 100%)',
        }}
      />

      {/* Pulsing glow behind logo */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, transparent 70%)',
          transform: 'translate(-50%, -70%)',
          opacity: glowOpacity,
          filter: 'blur(60px)',
        }}
      />

      {/* Content container */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Logo - Checkmark in hexagon */}
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
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
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
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
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
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
            }}
          >
            Make every repo AI-agent ready
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
