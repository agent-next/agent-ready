import { Composition } from "remotion";
import {
  AgentReadyVideo,
  IntroScene,
  PillarsScene,
  LevelsScene,
  CLIScene,
  OutroScene,
  // Enhanced versions with Nano Banana Pro assets
  AgentReadyVideoEnhanced,
  IntroSceneEnhanced,
  PillarsSceneEnhanced,
  LevelsSceneEnhanced,
  CLISceneEnhanced,
  OutroSceneEnhanced,
  // V2 - Clean Gemini 3 Pro Image backgrounds
  AgentReadyVideoV2,
} from "./AgentReady";

// Duration calculation (original v3):
// Intro: 90, Pillars: 130, Levels: 130, CLI: 180, Outro: 100
// Transitions: 25 + 25 + 20 + 25 = 95 frames subtracted (overlap)
// Total: 90 + 130 + 130 + 180 + 100 - 95 = 535 frames (~18 seconds)

// Duration calculation (enhanced):
// Intro: 3s=90, Pillars: 4.5s=135, Levels: 4.5s=135, CLI: 6s=180, Outro: 3s=90
// Transitions: 0.8+0.8+0.6+0.8=3s=90 frames subtracted
// Total: 90 + 135 + 135 + 180 + 90 - 90 = 540 frames (~18 seconds)

// Duration calculation (V2 enhanced - with exit animations):
// Intro: 3.5s=105, Pillars: 5s=150, Levels: 4.5s=135, CLI: 6.5s=195, Outro: 3.5s=105
// Transitions: 4 x 0.7s = 84 frames overlap
// Total: 105 + 150 + 135 + 195 + 105 - 84 = 606 frames (~20 seconds)

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* V2 Main Video with clean Gemini 3 Pro Image backgrounds */}
      <Composition
        id="AgentReadyPromoV2"
        component={AgentReadyVideoV2}
        durationInFrames={606}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Enhanced Main Video with Nano Banana Pro assets */}
      <Composition
        id="AgentReadyPromoEnhanced"
        component={AgentReadyVideoEnhanced}
        durationInFrames={540}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Original Main Video */}
      <Composition
        id="AgentReadyPromo"
        component={AgentReadyVideo}
        durationInFrames={535}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Individual scenes for editing */}
      <Composition
        id="IntroScene"
        component={IntroScene}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="PillarsScene"
        component={PillarsScene}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="LevelsScene"
        component={LevelsScene}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="CLIScene"
        component={CLIScene}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="OutroScene"
        component={OutroScene}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Enhanced individual scenes with Nano Banana Pro assets */}
      <Composition
        id="IntroSceneEnhanced"
        component={IntroSceneEnhanced}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="PillarsSceneEnhanced"
        component={PillarsSceneEnhanced}
        durationInFrames={135}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="LevelsSceneEnhanced"
        component={LevelsSceneEnhanced}
        durationInFrames={135}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="CLISceneEnhanced"
        component={CLISceneEnhanced}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="OutroSceneEnhanced"
        component={OutroSceneEnhanced}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
