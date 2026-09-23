/**
 * Enhanced CLI Scene
 *
 * Shows terminal demo with typing animation
 * Uses AI-generated background
 */

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from 'remotion';
import { AnimatedBackground, GeneratedAssets } from './GeneratedAssets';

// Terminal output lines with timing
const CLI_LINES = [
  { text: '$ npx agent-ready scan .', delay: 0, color: '#22c55e' },
  { text: '', delay: 0.3, color: 'white' },
  { text: '🔍 Scanning repository...', delay: 0.5, color: '#a5b4fc' },
  { text: '', delay: 0.8, color: 'white' },
  { text: '📖 Documentation    ████████░░  80%', delay: 1.0, color: '#3b82f6' },
  { text: '✨ Code Style       ██████████  100%', delay: 1.3, color: '#8b5cf6' },
  { text: '🔧 Build System     █████████░  90%', delay: 1.6, color: '#f59e0b' },
  { text: '🧪 Testing          ███████░░░  70%', delay: 1.9, color: '#10b981' },
  { text: '🔒 Security         ████████░░  85%', delay: 2.2, color: '#ef4444' },
  { text: '📊 Observability    ██████░░░░  60%', delay: 2.5, color: '#06b6d4' },
  { text: '🌍 Environment      █████████░  95%', delay: 2.8, color: '#84cc16' },
  { text: '📋 Task Discovery   ████████░░  80%', delay: 3.1, color: '#f97316' },
  { text: '🚀 Product          ███████░░░  75%', delay: 3.4, color: '#ec4899' },
  { text: '', delay: 3.7, color: 'white' },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', delay: 3.9, color: '#4b5563' },
  { text: '', delay: 4.0, color: 'white' },
  { text: '✅ Overall Score: 82%', delay: 4.2, color: '#22c55e' },
  { text: '🏆 Level: L3 - Standardized', delay: 4.5, color: '#eab308' },
  { text: '', delay: 4.8, color: 'white' },
  { text: '💡 Run `agent-ready report` for details', delay: 5.0, color: '#a5b4fc' },
];

// Typing animation for a single character
const TypingChar: React.FC<{ char: string; delay: number; color: string }> = ({
  char,
  delay,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delayFrames = delay * fps;
  const opacity = interpolate(frame, [delayFrames, delayFrames + 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <span style={{ opacity, color }}>
      {char}
    </span>
  );
};

// Typing animation for a line
const TypingLine: React.FC<{ text: string; startDelay: number; color: string }> = ({
  text,
  startDelay,
  color,
}) => {
  const charDelay = 0.03; // 30ms per character

  return (
    <div style={{ minHeight: 28, fontFamily: 'monospace', fontSize: 18 }}>
      {text.split('').map((char, i) => (
        <TypingChar
          key={i}
          char={char}
          delay={startDelay + i * charDelay}
          color={color}
        />
      ))}
    </div>
  );
};

export const CLISceneEnhanced: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Terminal window entrance
  const terminalScale = spring({
    frame,
    fps,
    config: { damping: 15 },
  });

  // Cursor blink (0.5s cycle)
  const cursorCycle = Math.floor((frame / fps) * 2) % 2;
  const cursorOpacity = cursorCycle === 0 ? 1 : 0;

  return (
    <AbsoluteFill>
      {/* AI-Generated background */}
      <AnimatedBackground
        src={GeneratedAssets.intro.circuit}
        parallaxSpeed={0.02}
        baseOpacity={0.3}
      />

      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(15, 15, 35, 0.7) 0%, rgba(15, 15, 35, 0.95) 100%)',
        }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 60,
        }}
      >
        {/* Terminal window */}
        <div
          style={{
            transform: `scale(${terminalScale})`,
            width: '100%',
            maxWidth: 900,
            background: 'linear-gradient(180deg, #1e1e2e 0%, #11111b 100%)',
            borderRadius: 16,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(99, 102, 241, 0.1)',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Title bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            {/* Traffic lights */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
            </div>
            {/* Title */}
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                color: '#6b7280',
                fontSize: 14,
                fontFamily: 'system-ui',
              }}
            >
              agent-ready — Terminal
            </div>
          </div>

          {/* Terminal content */}
          <div
            style={{
              padding: 24,
              minHeight: 500,
            }}
          >
            {CLI_LINES.map((line, index) => (
              <TypingLine
                key={index}
                text={line.text}
                startDelay={line.delay}
                color={line.color}
              />
            ))}

            {/* Blinking cursor */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
              <span style={{ color: '#22c55e', fontFamily: 'monospace', fontSize: 18 }}>$</span>
              <div
                style={{
                  width: 10,
                  height: 20,
                  background: '#22c55e',
                  marginLeft: 8,
                  opacity: cursorOpacity,
                }}
              />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
