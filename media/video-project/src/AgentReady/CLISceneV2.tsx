/**
 * CLI Scene V2 - Circuit background
 * FIXED: Larger terminal, full text visible, more visible background
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

const CLI_LINES = [
  { text: '$ npx agent-ready scan .', delay: 0, color: '#22c55e' },
  { text: '', delay: 0.3, color: 'white' },
  { text: '🔍 Scanning repository...', delay: 0.5, color: '#a5b4fc' },
  { text: '', delay: 0.8, color: 'white' },
  { text: '📖 Documentation     ████████░░  80%', delay: 1.0, color: '#3b82f6' },
  { text: '✨ Code Style        ██████████  100%', delay: 1.3, color: '#8b5cf6' },
  { text: '🔧 Build System      █████████░  90%', delay: 1.6, color: '#f59e0b' },
  { text: '🧪 Testing           ███████░░░  70%', delay: 1.9, color: '#10b981' },
  { text: '🔒 Security          ████████░░  85%', delay: 2.2, color: '#ef4444' },
  { text: '📊 Observability     ██████░░░░  60%', delay: 2.5, color: '#06b6d4' },
  { text: '🌍 Environment       █████████░  95%', delay: 2.8, color: '#84cc16' },
  { text: '📋 Task Discovery    ████████░░  80%', delay: 3.1, color: '#f97316' },
  { text: '🚀 Product           ███████░░░  75%', delay: 3.4, color: '#ec4899' },
  { text: '', delay: 3.7, color: 'white' },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', delay: 3.9, color: '#4b5563' },
  { text: '', delay: 4.0, color: 'white' },
  { text: '✅ Overall Score: 82%', delay: 4.2, color: '#22c55e' },
  { text: '🏆 Level: L3 - Standardized', delay: 4.5, color: '#eab308' },
  { text: '', delay: 4.8, color: 'white' },
  { text: '💡 Run `agent-ready report` for detailed analysis', delay: 5.0, color: '#a5b4fc' },
];

const TypingLine: React.FC<{
  text: string;
  startDelay: number;
  color: string;
  frame: number;
  fps: number;
  durationInFrames: number;
}> = ({ text, startDelay, color, frame, fps, durationInFrames }) => {
  const startFrame = startDelay * fps;
  // Slower typing: 40 chars/sec instead of 50
  const charsPerSecond = 40;
  const charsToShow = Math.floor(Math.max(0, (frame - startFrame) / fps * charsPerSecond));
  const visibleText = text.substring(0, Math.min(charsToShow, text.length));

  // Exit animation
  const exitStart = durationInFrames - 15;
  const exitOpacity = interpolate(frame, [exitStart, durationInFrames], [1, 0.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacity = interpolate(frame, [startFrame, startFrame + 2], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }) * exitOpacity;

  return (
    <div
      style={{
        minHeight: 36,
        fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Fira Mono", monospace',
        fontSize: 22,
        opacity,
        letterSpacing: '0.5px',
      }}
    >
      <span style={{ color }}>{visibleText}</span>
    </div>
  );
};

export const CLISceneV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Exit animation - terminal slides down
  const exitStart = durationInFrames - 15;
  const exitProgress = interpolate(frame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitY = exitProgress * 50;
  const exitOpacity = 1 - exitProgress * 0.3;
  const exitScale = 1 - exitProgress * 0.05;

  // Terminal entrance
  const terminalScale = spring({
    frame,
    fps,
    config: { damping: 12 },
  }) * exitScale;

  // Cursor blink
  const cursorVisible = Math.floor((frame / fps) * 2) % 2 === 0;

  return (
    <AbsoluteFill>
      {/* Circuit background - more visible */}
      <SubtleBackground src={AssetsV2.cli} opacity={0.45} />

      {/* Dark overlay for terminal contrast */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(10, 10, 26, 0.5) 0%, rgba(10, 10, 26, 0.85) 100%)',
        }}
      />

      {/* Terminal */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        }}
      >
        <div
          style={{
            transform: `scale(${terminalScale}) translateY(${exitY}px)`,
            opacity: exitOpacity,
            width: '100%',
            maxWidth: 1000,
            background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
            borderRadius: 20,
            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), 0 0 120px rgba(99, 102, 241, 0.15)',
            overflow: 'hidden',
            border: '2px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Title bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              background: 'rgba(0, 0, 0, 0.4)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#28c840' }} />
            </div>
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                color: '#8b8b9e',
                fontSize: 16,
                fontFamily: 'system-ui',
                fontWeight: 500,
              }}
            >
              agent-ready — Terminal
            </div>
          </div>

          {/* Terminal content */}
          <div style={{ padding: 28, minHeight: 560 }}>
            {CLI_LINES.map((line, index) => (
              <TypingLine
                key={index}
                text={line.text}
                startDelay={line.delay}
                color={line.color}
                frame={frame}
                fps={fps}
                durationInFrames={durationInFrames}
              />
            ))}

            {/* Cursor */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
              <span
                style={{
                  color: '#22c55e',
                  fontFamily: '"SF Mono", monospace',
                  fontSize: 22,
                }}
              >
                $
              </span>
              <div
                style={{
                  width: 12,
                  height: 24,
                  background: '#22c55e',
                  marginLeft: 10,
                  opacity: cursorVisible ? 1 : 0,
                  boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
                }}
              />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
