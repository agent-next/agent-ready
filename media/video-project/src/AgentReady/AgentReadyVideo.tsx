import React from 'react';
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { IntroScene } from './IntroScene';
import { PillarsScene } from './PillarsScene';
import { LevelsScene } from './LevelsScene';
import { CLIScene } from './CLIScene';
import { OutroScene } from './OutroScene';

export const AgentReadyVideo: React.FC = () => {
  return (
    <TransitionSeries>
      {/* Scene 1: Intro - Hook the viewer */}
      <TransitionSeries.Sequence durationInFrames={90}>
        <IntroScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: 'from-right' })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
      />

      {/* Scene 2: 9 Pillars - Show the framework */}
      <TransitionSeries.Sequence durationInFrames={130}>
        <PillarsScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: 'from-bottom' })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
      />

      {/* Scene 3: 5 Levels - Show progression */}
      <TransitionSeries.Sequence durationInFrames={130}>
        <LevelsScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 20 })}
      />

      {/* Scene 4: CLI Demo - Show it in action */}
      <TransitionSeries.Sequence durationInFrames={180}>
        <CLIScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: 'from-bottom' })}
        timing={springTiming({ config: { damping: 15 }, durationInFrames: 25 })}
      />

      {/* Scene 5: Outro - Call to action */}
      <TransitionSeries.Sequence durationInFrames={100}>
        <OutroScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
