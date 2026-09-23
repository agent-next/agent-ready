/**
 * Pillars Scene V2 - Neural network background
 * FIXED: Larger cards, better spacing, more visible background
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

const PILLARS = [
  { name: 'Documentation', emoji: '📖', color: '#3b82f6' },
  { name: 'Code Style', emoji: '✨', color: '#8b5cf6' },
  { name: 'Build System', emoji: '🔧', color: '#f59e0b' },
  { name: 'Testing', emoji: '🧪', color: '#10b981' },
  { name: 'Security', emoji: '🔒', color: '#ef4444' },
  { name: 'Observability', emoji: '📊', color: '#06b6d4' },
  { name: 'Environment', emoji: '🌍', color: '#84cc16' },
  { name: 'Task Discovery', emoji: '📋', color: '#f97316' },
  { name: 'Product', emoji: '🚀', color: '#ec4899' },
];

const PillarCard: React.FC<{
  pillar: typeof PILLARS[0];
  index: number;
  frame: number;
  fps: number;
  durationInFrames: number;
}> = ({ pillar, index, frame, fps, durationInFrames }) => {
  // Increased stagger from 0.08s to 0.15s for better readability
  const delay = index * 0.15;
  const delayFrames = delay * fps;

  const enterSpring = spring({
    frame: frame - delayFrames,
    fps,
    config: { damping: 12 },
  });

  // Exit animation - cards float up and fade
  const exitStart = durationInFrames - 15;
  const exitProgress = interpolate(frame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitY = exitProgress * -30;
  const exitOpacity = 1 - exitProgress * 0.4;

  const opacity = interpolate(frame, [delayFrames, delayFrames + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }) * exitOpacity;

  // Floating effect
  const floatOffset = Math.sin((frame / fps + index * 0.2) * Math.PI * 2) * 4;

  // Entrance rotation: start at -5deg, spring to 0deg
  const entranceRotation = interpolate(enterSpring, [0, 1], [-5, 0]);

  return (
    <div
      style={{
        transform: `scale(${Math.max(0, enterSpring)}) translateY(${floatOffset + exitY}px) rotate(${entranceRotation}deg)`,
        opacity,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: 'rgba(20, 20, 40, 0.85)',
        padding: '20px 32px',
        borderRadius: 20,
        border: `3px solid ${pillar.color}60`,
        boxShadow: `0 8px 32px ${pillar.color}30, inset 0 1px 0 rgba(255,255,255,0.1)`,
        minWidth: 280,
      }}
    >
      <span style={{ fontSize: 40 }}>{pillar.emoji}</span>
      <span
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: 'white',
          fontFamily: 'system-ui',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)',
        }}
      >
        {pillar.name}
      </span>
    </div>
  );
};

export const PillarsSceneV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Exit animation
  const exitStart = durationInFrames - 15;
  const exitProgress = interpolate(frame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = 1 - exitProgress * 0.1;
  const exitOpacity = 1 - exitProgress * 0.3;

  // Title animation
  const titleScale = spring({
    frame,
    fps,
    config: { damping: 15 },
  }) * exitScale;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #151530 100%)',
      }}
    >
      {/* Neural network background - more visible */}
      <SubtleBackground src={AssetsV2.pillars} opacity={0.5} />

      {/* Gradient overlay for depth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10, 10, 26, 0.6) 100%)',
        }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingTop: 60,
        }}
      >
        {/* Title */}
        <div style={{ transform: `scale(${titleScale})`, marginBottom: 60, opacity: exitOpacity }}>
          <h2
            style={{
              fontSize: 88,
              fontWeight: 800,
              color: '#a5b4fc',
              margin: 0,
              fontFamily: 'system-ui',
              letterSpacing: '-3px',
              textShadow: '0 4px 30px rgba(99, 102, 241, 0.5)',
            }}
          >
            9 Pillars of Readiness
          </h2>
        </div>

        {/* Pillars grid - 3x3 with better spacing */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, auto)',
            gap: 24,
            padding: '0 80px',
          }}
        >
          {PILLARS.map((pillar, index) => (
            <PillarCard
              key={pillar.name}
              pillar={pillar}
              index={index}
              frame={frame}
              fps={fps}
              durationInFrames={durationInFrames}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
