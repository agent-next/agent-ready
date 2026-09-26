/**
 * Intro Scene V2 - Enhanced with clean Gemini 3 Pro backgrounds
 */

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  random,
} from 'remotion';
import { AssetsV2, SubtleBackground } from './GeneratedAssetsV2';

// Color palette for particles
const PARTICLE_COLORS = [
  { r: 129, g: 140, b: 248 }, // Indigo
  { r: 168, g: 85, b: 247 },  // Purple
  { r: 34, g: 211, b: 238 },  // Cyan
  { r: 99, g: 102, b: 241 },  // Blue
  { r: 192, g: 132, b: 252 }, // Light purple
];

// Floating particles with varied colors and rotation
const Particle: React.FC<{ index: number; frame: number; durationInFrames: number }> = ({ index, frame, durationInFrames }) => {
  const x = random(`x-${index}`) * 100;
  const y = random(`y-${index}`) * 100;
  const size = 2 + random(`size-${index}`) * 6; // Varied sizes
  const speed = 0.5 + random(`speed-${index}`) * 1.5;
  const delay = random(`delay-${index}`) * 60;
  const colorIndex = Math.floor(random(`color-${index}`) * PARTICLE_COLORS.length);
  const color = PARTICLE_COLORS[colorIndex];
  const rotation = random(`rot-${index}`) * 360;

  // Exit fade
  const exitStart = durationInFrames - 15;
  const exitOpacity = interpolate(frame, [exitStart, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacity = interpolate(
    frame - delay,
    [0, 30, 60, 90],
    [0, 0.6, 0.6, 0.4],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  ) * exitOpacity;

  const yOffset = ((frame - delay) * speed) % 100;
  const rotationAnim = rotation + frame * (0.5 + random(`rotSpeed-${index}`) * 2);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${(y + yOffset) % 100}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`,
        boxShadow: `0 0 ${size * 2}px rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.5})`,
        transform: `rotate(${rotationAnim}deg)`,
      }}
    />
  );
};

export const IntroSceneV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Exit animation - starts 0.5s (15 frames) before end
  const exitStart = durationInFrames - 15;
  const exitProgress = interpolate(frame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = 1 - exitProgress * 0.1;
  const exitOpacity = 1 - exitProgress * 0.3;

  // Logo animation
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12 },
  }) * exitScale;

  const logoRotation = interpolate(
    spring({ frame, fps, config: { damping: 200 } }),
    [0, 1],
    [-180, 0]
  );

  // Title animation
  const titleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }) * exitOpacity;

  const titleY = interpolate(
    spring({ frame: frame - 20, fps, config: { damping: 200 } }),
    [0, 1],
    [50, 0]
  ) - exitProgress * 20;

  // Subtitle animation
  const subtitleOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }) * exitOpacity;

  // Glow effect - pulsing synced
  const pulseGlow = Math.sin(frame / 10) * 0.3;
  const glowOpacity = interpolate(frame, [0, 30, 60], [0, 0.8, 0.4 + pulseGlow], {
    extrapolateRight: 'clamp',
  }) * exitOpacity;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* AI-generated cosmic background - more visible */}
      <SubtleBackground src={AssetsV2.intro} opacity={0.55} />

      {/* Floating particles - 50 with varied colors */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Particle key={i} index={i} frame={frame} durationInFrames={durationInFrames} />
      ))}

      {/* Background glow */}
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

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale}) rotate(${logoRotation}deg)`,
          marginBottom: 40,
        }}
      >
        <svg width="200" height="200" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="logoGradientV2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <filter id="glowV2">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <polygon
            points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
            fill="url(#logoGradientV2)"
            filter="url(#glowV2)"
          />
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
            fontSize: 120,
            fontWeight: 800,
            color: 'white',
            margin: 0,
            fontFamily: 'system-ui',
            letterSpacing: '-4px',
            textShadow: '0 4px 30px rgba(0,0,0,0.5)',
          }}
        >
          agent-ready
        </h1>
      </div>

      {/* Subtitle */}
      <div style={{ opacity: subtitleOpacity, marginTop: 30 }}>
        <p
          style={{
            fontSize: 48,
            color: 'white',
            margin: 0,
            fontFamily: 'system-ui',
            fontWeight: 500,
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}
        >
          Make every repo AI-agent ready
        </p>
      </div>
    </AbsoluteFill>
  );
};
