import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  AbsoluteFill,
} from 'remotion';

const TERMINAL_BUTTON_COLORS = ['#ef4444', '#f59e0b', '#22c55e'];

function getLineColor(line: string): string {
  if (line.includes('████')) return '#818cf8';
  if (line.includes('Level: L3') || line.includes('Score: 85%')) return '#fbbf24';
  if (line.startsWith('$')) return '#22c55e';
  return '#e5e5e5';
}

function isHighlightLine(line: string): boolean {
  return line.includes('Level: L3') || line.includes('Score: 85%');
}

const CLI_OUTPUT = [
  '$ npx agent-ready scan .',
  '',
  '🔍 Scanning repository...',
  '',
  '✓ Agent Readiness Report',
  '══════════════════════════════════════════════',
  '  Repository: your-awesome-project',
  '  Profile:    factory_compat v1.0.0',
  '',
  '┌─────────────────────────────────────────────┐',
  '│                                             │',
  '│      ⭐  Level: L3  ·  Score: 85%  ⭐       │',
  '│                                             │',
  '└─────────────────────────────────────────────┘',
  '',
  '📊 Pillar Summary',
  '──────────────────────────────────────────────',
  '  Documentation      L5   100% ████████████ ✓',
  '  Style & Validation L5   100% ████████████ ✓',
  '  Build System       L5   100% ████████████ ✓',
  '  Testing            L3    67% ████████░░░░',
  '  Security           L5    75% █████████░░░',
  '',
  '🚀 Ready for AI agents!',
];

export const CLIScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate visible lines with typewriter effect - slower for readability
  const linesPerSecond = 5;
  const visibleLineCount = Math.floor((frame / fps) * linesPerSecond);

  // Terminal window animation
  const terminalScale = spring({
    frame,
    fps,
    config: { damping: 15 },
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #1e1e3f 0%, #0f0f23 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
      }}
    >
      {/* Terminal window */}
      <div
        style={{
          transform: `scale(${terminalScale})`,
          width: '100%',
          maxWidth: 1400,
          background: '#1a1a2e',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Terminal header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            background: 'linear-gradient(180deg, #1e1e3a 0%, #16162a 100%)',
            gap: 8,
            borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
          }}
        >
          {TERMINAL_BUTTON_COLORS.map((color) => (
            <div
              key={color}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 6px ${color}`,
              }}
            />
          ))}
          <span
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              color: '#818cf8',
              fontSize: 14,
              fontFamily: 'monospace',
              fontWeight: 600,
            }}
          >
            agent-ready
          </span>
          <div style={{ width: 36 }} />
        </div>

        {/* Terminal content */}
        <div
          style={{
            padding: 32,
            fontFamily: 'monospace',
            fontSize: 22,
            lineHeight: 1.7,
            color: '#e5e5e5',
            minHeight: 500,
          }}
        >
          {CLI_OUTPUT.slice(0, visibleLineCount).map((line, index) => (
            <div
              key={index}
              style={{
                color: getLineColor(line),
                fontWeight: isHighlightLine(line) ? 700 : 400,
                whiteSpace: 'pre',
              }}
            >
              {line || '\u00A0'}
            </div>
          ))}

          {/* Cursor */}
          {visibleLineCount <= CLI_OUTPUT.length && (
            <span
              style={{
                opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0,
                color: '#22c55e',
              }}
            >
              █
            </span>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
