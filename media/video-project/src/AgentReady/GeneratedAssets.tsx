/**
 * Generated Assets Component
 *
 * Integrates Nano Banana Pro generated images into Remotion video
 * Following Remotion best practices:
 * - Use <Img> component from remotion (NOT native <img>)
 * - Use staticFile() for public folder assets
 * - Drive all animations with useCurrentFrame() (NO CSS transitions)
 */

import React from 'react';
import { Img, staticFile, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

// Asset paths for generated images (placed in public/generated/)
const GENERATED_PATH = 'generated';

export const GeneratedAssets = {
  // Intro backgrounds
  intro: {
    space: staticFile(`${GENERATED_PATH}/intro/intro-bg-1.jpeg`),
    circuit: staticFile(`${GENERATED_PATH}/intro/intro-bg-2.jpeg`),
    neural: staticFile(`${GENERATED_PATH}/intro/intro-bg-3.jpeg`),
  },

  // Glowing badges for animation
  badges: {
    L1: staticFile(`${GENERATED_PATH}/badges/badge-L1-glow.jpeg`),
    L2: staticFile(`${GENERATED_PATH}/badges/badge-L2-glow.jpeg`),
    L3: staticFile(`${GENERATED_PATH}/badges/badge-L3-glow.jpeg`),
    L4: staticFile(`${GENERATED_PATH}/badges/badge-L4-glow.jpeg`),
    L5: staticFile(`${GENERATED_PATH}/badges/badge-L5-glow.jpeg`),
  },

  // Pillar icons
  pillars: {
    documentation: staticFile(`${GENERATED_PATH}/pillars/pillar-documentation.jpeg`),
    codeStyle: staticFile(`${GENERATED_PATH}/pillars/pillar-code-style.jpeg`),
    build: staticFile(`${GENERATED_PATH}/pillars/pillar-build.jpeg`),
    testing: staticFile(`${GENERATED_PATH}/pillars/pillar-testing.jpeg`),
    security: staticFile(`${GENERATED_PATH}/pillars/pillar-security.jpeg`),
    observability: staticFile(`${GENERATED_PATH}/pillars/pillar-observability.jpeg`),
    environment: staticFile(`${GENERATED_PATH}/pillars/pillar-environment.jpeg`),
    taskDiscovery: staticFile(`${GENERATED_PATH}/pillars/pillar-task-discovery.jpeg`),
    product: staticFile(`${GENERATED_PATH}/pillars/pillar-product.jpeg`),
  },

  // Transitions
  transitions: {
    wipeCode: staticFile(`${GENERATED_PATH}/transitions/transition-wipe-code.jpeg`),
    pillarsToLevels: staticFile(`${GENERATED_PATH}/transitions/transition-pillars-to-levels.jpeg`),
    glowBurst: staticFile(`${GENERATED_PATH}/transitions/transition-glow-burst.jpeg`),
  },

  // Outro
  outro: {
    ctaBackground: staticFile(`${GENERATED_PATH}/outro/outro-cta-bg.jpeg`),
  },
};

/**
 * Animated background with parallax effect
 * All animations driven by useCurrentFrame()
 */
export const AnimatedBackground: React.FC<{
  src: string;
  parallaxSpeed?: number;
  baseOpacity?: number;
}> = ({ src, parallaxSpeed = 0.1, baseOpacity = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Parallax movement driven by frame
  const translateY = frame * parallaxSpeed;

  // Subtle breathing scale effect
  const breathingCycle = (frame / fps) * Math.PI; // One cycle per second
  const scale = 1.1 + Math.sin(breathingCycle) * 0.02;

  // Fade in over first 0.5 seconds
  const opacity = interpolate(frame, [0, fps * 0.5], [0, baseOpacity], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: -50,
        overflow: 'hidden',
      }}
    >
      <Img
        src={src}
        style={{
          width: '120%',
          height: '120%',
          objectFit: 'cover',
          transform: `translateY(${translateY}px) scale(${scale})`,
          opacity,
        }}
      />
    </div>
  );
};

/**
 * Pulsing badge with glow animation
 * Animation timing in seconds, converted to frames
 */
export const PulsingBadge: React.FC<{
  level: 1 | 2 | 3 | 4 | 5;
  size?: number;
  delayInSeconds?: number;
}> = ({ level, size = 200, delayInSeconds = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delayFrames = delayInSeconds * fps;
  const adjustedFrame = Math.max(0, frame - delayFrames);

  // Entrance animation (0.5 seconds)
  const entranceScale = interpolate(adjustedFrame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Continuous pulse effect (1 cycle per 0.3 seconds)
  const pulseCycle = (adjustedFrame / fps) * Math.PI * 3.3;
  const pulseScale = 1 + Math.sin(pulseCycle) * 0.05;

  // Combined scale
  const finalScale = entranceScale * pulseScale;

  // Glow intensity varies with pulse
  const glowIntensity = 10 + Math.sin(pulseCycle) * 5;

  const badgeSrc = GeneratedAssets.badges[`L${level}` as keyof typeof GeneratedAssets.badges];

  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `scale(${finalScale})`,
        filter: `drop-shadow(0 0 ${glowIntensity}px rgba(255, 255, 255, 0.5))`,
      }}
    >
      <Img
        src={badgeSrc}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

/**
 * Animated pillar icon with floating effect
 */
export const AnimatedPillarIcon: React.FC<{
  pillar: keyof typeof GeneratedAssets.pillars;
  size?: number;
  delayInSeconds?: number;
}> = ({ pillar, size = 80, delayInSeconds = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delayFrames = delayInSeconds * fps;
  const adjustedFrame = Math.max(0, frame - delayFrames);

  // Pop-in animation (0.4 seconds)
  const entranceScale = interpolate(adjustedFrame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Floating effect (1 cycle per 0.5 seconds)
  const floatCycle = (adjustedFrame / fps) * Math.PI * 2;
  const floatOffset = Math.sin(floatCycle) * 3;

  // Glow pulse (1 cycle per 0.3 seconds)
  const glowCycle = (adjustedFrame / fps) * Math.PI * 3.3;
  const glowIntensity = 5 + Math.sin(glowCycle) * 3;

  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `scale(${entranceScale}) translateY(${floatOffset}px)`,
        filter: `drop-shadow(0 0 ${glowIntensity}px rgba(99, 102, 241, 0.6))`,
      }}
    >
      <Img
        src={GeneratedAssets.pillars[pillar]}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: 12,
        }}
      />
    </div>
  );
};

/**
 * Crossfade between multiple backgrounds
 * Duration specified in seconds
 */
export const CrossfadeBackgrounds: React.FC<{
  sources: string[];
  durationInSeconds: number;
}> = ({ sources, durationInSeconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const durationFrames = durationInSeconds * fps;
  const totalDuration = sources.length * durationFrames;
  const cycleFrame = frame % totalDuration;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {sources.map((src, index) => {
        const startFrame = index * durationFrames;
        const fadeInEnd = startFrame + durationFrames * 0.1;
        const fadeOutStart = startFrame + durationFrames * 0.9;
        const endFrame = startFrame + durationFrames;

        const opacity = interpolate(
          cycleFrame,
          [startFrame, fadeInEnd, fadeOutStart, endFrame],
          [0, 1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              inset: 0,
              opacity,
            }}
          >
            <Img
              src={src}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
