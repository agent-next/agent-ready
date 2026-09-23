/**
 * Agent Ready Video V2
 *
 * Enhanced with clean Gemini 3 Pro Image backgrounds
 * Using Remotion TransitionSeries for smooth scene transitions
 */

import React from 'react';
import { useVideoConfig } from 'remotion';
import { TransitionSeries, springTiming, linearTiming } from '@remotion/transitions';
import { wipe } from '@remotion/transitions/wipe';
import { fade } from '@remotion/transitions/fade';

import { IntroSceneV2 } from './IntroSceneV2';
import { PillarsSceneV2 } from './PillarsSceneV2';
import { LevelsSceneV2 } from './LevelsSceneV2';
import { CLISceneV2 } from './CLISceneV2';
import { OutroSceneV2 } from './OutroSceneV2';

/**
 * Duration breakdown (at 30fps) - Enhanced with exit animations:
 * - Intro: 3.5s = 105 frames
 * - Pillars: 5s = 150 frames
 * - Levels: 4.5s = 135 frames
 * - CLI: 6.5s = 195 frames
 * - Outro: 3.5s = 105 frames
 * - Transitions: 4 x 0.7s = 84 frames overlap
 * Total: 690 - 84 = 606 frames (~20 seconds)
 */

export const AgentReadyVideoV2: React.FC = () => {
  const { fps } = useVideoConfig();

  const transitionDuration = Math.round(0.7 * fps);

  return (
    <TransitionSeries>
      {/* Intro Scene - 3.5s */}
      <TransitionSeries.Sequence durationInFrames={3.5 * fps}>
        <IntroSceneV2 />
      </TransitionSeries.Sequence>

      {/* Transition: Wipe to Pillars */}
      <TransitionSeries.Transition
        presentation={wipe({ direction: 'from-right' })}
        timing={springTiming({
          config: { damping: 200 },
          durationInFrames: transitionDuration,
        })}
      />

      {/* Pillars Scene - 5s */}
      <TransitionSeries.Sequence durationInFrames={5 * fps}>
        <PillarsSceneV2 />
      </TransitionSeries.Sequence>

      {/* Transition: Fade to Levels */}
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({
          durationInFrames: transitionDuration,
        })}
      />

      {/* Levels Scene - 4.5s */}
      <TransitionSeries.Sequence durationInFrames={4.5 * fps}>
        <LevelsSceneV2 />
      </TransitionSeries.Sequence>

      {/* Transition: Wipe to CLI */}
      <TransitionSeries.Transition
        presentation={wipe({ direction: 'from-bottom' })}
        timing={springTiming({
          config: { damping: 200 },
          durationInFrames: transitionDuration,
        })}
      />

      {/* CLI Scene - 6.5s */}
      <TransitionSeries.Sequence durationInFrames={6.5 * fps}>
        <CLISceneV2 />
      </TransitionSeries.Sequence>

      {/* Transition: Fade to Outro */}
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({
          durationInFrames: transitionDuration,
        })}
      />

      {/* Outro Scene - 3.5s */}
      <TransitionSeries.Sequence durationInFrames={3.5 * fps}>
        <OutroSceneV2 />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
