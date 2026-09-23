/**
 * Enhanced Agent Ready Video
 *
 * Complete promo video using Nano Banana Pro generated assets
 * Following Remotion best practices:
 * - TransitionSeries for smooth scene transitions
 * - spring() with proper damping configs
 * - All timing in seconds * fps
 * - <Img> component for all images
 * - staticFile() for public assets
 */

import React from 'react';
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { useVideoConfig } from 'remotion';

import { IntroSceneEnhanced } from './IntroSceneEnhanced';
import { PillarsSceneEnhanced } from './PillarsSceneEnhanced';
import { LevelsSceneEnhanced } from './LevelsSceneEnhanced';
import { CLISceneEnhanced } from './CLISceneEnhanced';
import { OutroSceneEnhanced } from './OutroSceneEnhanced';

export const AgentReadyVideoEnhanced: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <TransitionSeries>
      {/* Scene 1: Intro - Hook the viewer (3 seconds) */}
      <TransitionSeries.Sequence durationInFrames={3 * fps}>
        <IntroSceneEnhanced />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: 'from-right' })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: Math.round(0.8 * fps) })}
      />

      {/* Scene 2: 9 Pillars - Show the framework (4.5 seconds) */}
      <TransitionSeries.Sequence durationInFrames={Math.round(4.5 * fps)}>
        <PillarsSceneEnhanced />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: 'from-bottom' })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: Math.round(0.8 * fps) })}
      />

      {/* Scene 3: 5 Levels - Show progression (4.5 seconds) */}
      <TransitionSeries.Sequence durationInFrames={Math.round(4.5 * fps)}>
        <LevelsSceneEnhanced />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: Math.round(0.6 * fps) })}
      />

      {/* Scene 4: CLI Demo - Show it in action (6 seconds) */}
      <TransitionSeries.Sequence durationInFrames={6 * fps}>
        <CLISceneEnhanced />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: 'from-bottom' })}
        timing={springTiming({ config: { damping: 15 }, durationInFrames: Math.round(0.8 * fps) })}
      />

      {/* Scene 5: Outro - Call to action (3 seconds) */}
      <TransitionSeries.Sequence durationInFrames={3 * fps}>
        <OutroSceneEnhanced />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
