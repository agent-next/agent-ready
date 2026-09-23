/**
 * Generated Assets V2 - Clean Abstract Backgrounds
 *
 * Uses Gemini 3 Pro Image generated clean backgrounds
 * NO TEXT in any background images
 */

import React from 'react';
import { Img, staticFile, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

const V2_PATH = 'generated-v2';

export const AssetsV2 = {
  intro: staticFile(`${V2_PATH}/intro/cosmic-bg.jpeg`),
  pillars: staticFile(`${V2_PATH}/pillars/neural-bg.jpeg`),
  levels: staticFile(`${V2_PATH}/levels/gradient-bg.jpeg`),
  cli: staticFile(`${V2_PATH}/cli/circuit-bg.jpeg`),
  outro: staticFile(`${V2_PATH}/outro/radiant-bg.jpeg`),
};

/**
 * Animated background - visible but not overwhelming
 */
export const SubtleBackground: React.FC<{
  src: string;
  opacity?: number;
}> = ({ src, opacity = 0.55 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow parallax
  const translateY = frame * 0.03;

  // Subtle scale breathing
  const scale = 1.08 + Math.sin((frame / fps) * Math.PI * 0.5) * 0.02;

  // Fade in
  const fadeIn = interpolate(frame, [0, fps * 0.3], [0, opacity], {
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ position: 'absolute', inset: -30, overflow: 'hidden' }}>
      <Img
        src={src}
        style={{
          width: '115%',
          height: '115%',
          objectFit: 'cover',
          transform: `translateY(${translateY}px) scale(${scale})`,
          opacity: fadeIn,
        }}
      />
    </div>
  );
};
