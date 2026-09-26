/**
 * Levels Scene V2 - Gradient background
 * FIXED: Larger text, better visual hierarchy, more visible background
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

const LEVELS = [
  { level: 'L1', name: 'Functional', desc: 'Code runs', color: '#ef4444' },
  { level: 'L2', name: 'Documented', desc: 'Has docs & CI', color: '#f59e0b' },
  { level: 'L3', name: 'Standardized', desc: 'Tests & observability', color: '#22c55e' },
  { level: 'L4', name: 'Optimized', desc: 'Fast feedback', color: '#3b82f6' },
  { level: 'L5', name: 'Autonomous', desc: 'Self-improving', color: '#8b5cf6' },
];

const LevelBar: React.FC<{
  level: typeof LEVELS[0];
  index: number;
  frame: number;
  fps: number;
  isHighlighted: boolean;
  durationInFrames: number;
}> = ({ level, index, frame, fps, isHighlighted, durationInFrames }) => {
  // Increased stagger from 0.12s to 0.18s for better readability
  const delay = 0.2 + index * 0.18;
  const delayFrames = delay * fps;

  const enterSpring = spring({
    frame: frame - delayFrames,
    fps,
    config: { damping: 12 },
  });

  // Exit animation - bars scale down
  const exitStart = durationInFrames - 15;
  const exitProgress = interpolate(frame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = 1 - exitProgress * 0.15;
  const exitOpacity = 1 - exitProgress * 0.4;

  const scale = enterSpring * exitScale;

  // Fill animation
  const fillProgress = interpolate(
    frame,
    [delayFrames + 8, delayFrames + 25],
    [0, (index + 1) * 20],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Glow for highlighted - synced pulsing
  const glowIntensity = isHighlighted ? 25 + Math.sin(frame / 10) * 10 : 0;

  return (
    <div
      style={{
        transform: `scale(${Math.max(0, scale)})`,
        opacity: exitOpacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      {/* Level badge */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 16,
          background: isHighlighted
            ? `linear-gradient(135deg, ${level.color} 0%, ${level.color}90 100%)`
            : 'rgba(30, 30, 50, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: `3px solid ${level.color}`,
          boxShadow: isHighlighted
            ? `0 0 ${glowIntensity}px ${level.color}, 0 8px 32px ${level.color}50`
            : `0 4px 20px rgba(0,0,0,0.3)`,
        }}
      >
        <span
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: 'white',
            fontFamily: 'system-ui',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          {level.level}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: 120,
          height: 200,
          background: 'rgba(30, 30, 50, 0.8)',
          borderRadius: 60,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          border: isHighlighted ? `3px solid ${level.color}` : '3px solid rgba(255,255,255,0.1)',
          boxShadow: isHighlighted ? `0 0 ${glowIntensity}px ${level.color}50` : 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            height: `${fillProgress}%`,
            background: `linear-gradient(180deg, ${level.color} 0%, ${level.color}80 100%)`,
            borderRadius: 60,
            boxShadow: `inset 0 2px 10px rgba(255,255,255,0.3)`,
          }}
        />
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'white',
            fontFamily: 'system-ui',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          {level.name}
        </div>
        <div
          style={{
            fontSize: 20,
            color: '#9ca3af',
            fontFamily: 'system-ui',
            marginTop: 4,
            textShadow: '0 1px 5px rgba(0,0,0,0.5)',
          }}
        >
          {level.desc}
        </div>
      </div>
    </div>
  );
};

export const LevelsSceneV2: React.FC = () => {
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

  // Highlight L3 as the target level
  const highlightedIndex = 2;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #151530 100%)',
      }}
    >
      {/* Gradient background - more visible */}
      <SubtleBackground src={AssetsV2.levels} opacity={0.5} />

      {/* Content */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 50,
        }}
      >
        {/* Title */}
        <div style={{ transform: `scale(${titleScale})`, opacity: exitOpacity }}>
          <h2
            style={{
              fontSize: 88,
              fontWeight: 800,
              color: '#6ee7b7',
              margin: 0,
              fontFamily: 'system-ui',
              letterSpacing: '-3px',
              textShadow: '0 4px 30px rgba(34, 197, 94, 0.5)',
            }}
          >
            5 Levels of Maturity
          </h2>
        </div>

        {/* Levels */}
        <div
          style={{
            display: 'flex',
            gap: 50,
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          {LEVELS.map((level, index) => (
            <LevelBar
              key={level.level}
              level={level}
              index={index}
              frame={frame}
              fps={fps}
              isHighlighted={index === highlightedIndex}
              durationInFrames={durationInFrames}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
