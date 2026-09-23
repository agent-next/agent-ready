#!/usr/bin/env npx tsx
/**
 * Generate video-specific assets using Nano Banana Pro
 *
 * Creates optimized images for Remotion video scenes:
 * - Intro backgrounds (animated frames)
 * - Scene transition frames
 * - Animated badge variants
 *
 * Usage:
 *   GEMINI_API_KEY=xxx npx tsx scripts/generate-video-assets.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_IMAGE_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent';

const OUTPUT_DIR = path.join(process.cwd(), 'video-project/public/generated');

async function generateImage(prompt: string, aspectRatio: string, imageSize: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY required');
  }

  const response = await fetch(`${GEMINI_IMAGE_API}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio, imageSize },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`API error: ${error.error?.message || response.statusText}`);
  }

  const result = await response.json();
  const imagePart = result.candidates?.[0]?.content?.parts?.find(
    (part: { inlineData?: { data: string } }) => part.inlineData
  );

  if (!imagePart?.inlineData) {
    throw new Error('No image in response');
  }

  return imagePart.inlineData.data;
}

function saveImage(data: string, filepath: string) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
  console.log(`  ✓ Saved: ${filepath}`);
}

async function generateIntroBackgrounds() {
  console.log('\n🎬 Generating Intro Scene Backgrounds...');

  const variants = [
    { name: 'intro-bg-1', desc: 'deep space with floating code particles, purple nebula' },
    { name: 'intro-bg-2', desc: 'circuit board patterns with glowing nodes, dark blue' },
    { name: 'intro-bg-3', desc: 'AI neural network visualization, indigo gradient' },
  ];

  for (const variant of variants) {
    console.log(`\n  ${variant.name}`);
    const prompt = `Create a seamless video background for AI tools intro.
Design: ${variant.desc}
- Dark gradient base (#0f0f23 to #1a1a3e)
- Subtle animated-look elements
- No text, purely visual
- 16:9 aspect ratio for video
- High contrast for text overlay`;

    try {
      const data = await generateImage(prompt, '16:9', '2K');
      saveImage(data, path.join(OUTPUT_DIR, 'intro', `${variant.name}.jpeg`));
    } catch (error) {
      console.error(`  ✗ Failed: ${error}`);
    }
  }
}

async function generateAnimatedBadges() {
  console.log('\n🏅 Generating Animated Badge Frames...');

  const levels = [
    { level: 1, name: 'Functional', color: '#ef4444', glow: 'red' },
    { level: 2, name: 'Documented', color: '#f97316', glow: 'orange' },
    { level: 3, name: 'Standardized', color: '#eab308', glow: 'yellow' },
    { level: 4, name: 'Optimized', color: '#22c55e', glow: 'green' },
    { level: 5, name: 'Autonomous', color: '#3b82f6', glow: 'blue' },
  ];

  // Generate glowing variants for animation
  for (const level of levels) {
    console.log(`\n  Level ${level.level} - ${level.name} (glow effect)`);

    const prompt = `Create a glowing animated badge for software maturity certification.

Design:
- Circular metallic badge with ${level.glow} glow effect
- Primary color: ${level.color}
- "L${level.level}" bold centered text
- "${level.name}" curved at bottom
- ${level.level} stars at top
- Strong outer glow/aura effect (for animation)
- Circuit pattern background
- Transparent or dark background
- 512px square`;

    try {
      const data = await generateImage(prompt, '1:1', '1K');
      saveImage(data, path.join(OUTPUT_DIR, 'badges', `badge-L${level.level}-glow.jpeg`));
    } catch (error) {
      console.error(`  ✗ Failed: ${error}`);
    }
  }
}

async function generatePillarIcons() {
  console.log('\n🏛️ Generating Video-Optimized Pillar Icons...');

  const pillars = [
    { name: 'documentation', icon: 'open book with glowing pages', color: '#3b82f6' },
    { name: 'code-style', icon: 'sparkling code brackets', color: '#8b5cf6' },
    { name: 'build', icon: 'glowing wrench and gears', color: '#f59e0b' },
    { name: 'testing', icon: 'glowing test tube with checkmark', color: '#10b981' },
    { name: 'security', icon: 'glowing shield with lock', color: '#ef4444' },
    { name: 'observability', icon: 'radar chart with data points', color: '#06b6d4' },
    { name: 'environment', icon: 'globe with server connections', color: '#84cc16' },
    { name: 'task-discovery', icon: 'checklist with magnifying glass', color: '#f97316' },
    { name: 'product', icon: 'rocket launching', color: '#ec4899' },
  ];

  for (const pillar of pillars) {
    console.log(`\n  ${pillar.name}`);

    const prompt = `Create an icon for "${pillar.name}" software pillar.

Design:
- ${pillar.icon}
- Neon glow effect with ${pillar.color} accent
- Dark transparent background
- Minimalist tech style
- 128px square, suitable for video overlay`;

    try {
      const data = await generateImage(prompt, '1:1', '1K');
      saveImage(data, path.join(OUTPUT_DIR, 'pillars', `pillar-${pillar.name}.jpeg`));
    } catch (error) {
      console.error(`  ✗ Failed: ${error}`);
    }
  }
}

async function generateTransitionFrames() {
  console.log('\n🎞️ Generating Scene Transition Frames...');

  const transitions = [
    {
      name: 'transition-wipe-code',
      prompt: 'Abstract code flowing from left to right, dark gradient, motion blur effect, 16:9'
    },
    {
      name: 'transition-pillars-to-levels',
      prompt: 'Hexagonal grid morphing into ascending bars, purple to green gradient, 16:9'
    },
    {
      name: 'transition-glow-burst',
      prompt: 'Central light burst radiating outward, indigo blue glow on dark background, 16:9'
    },
  ];

  for (const transition of transitions) {
    console.log(`\n  ${transition.name}`);

    try {
      const data = await generateImage(transition.prompt, '16:9', '1K');
      saveImage(data, path.join(OUTPUT_DIR, 'transitions', `${transition.name}.jpeg`));
    } catch (error) {
      console.error(`  ✗ Failed: ${error}`);
    }
  }
}

async function generateOutroAssets() {
  console.log('\n🎬 Generating Outro Scene Assets...');

  const prompt = `Create a call-to-action background for developer tools video.

Design:
- Dark gradient (slate-900 to indigo-900)
- Subtle code/circuit patterns
- Central spotlight effect
- Space for "Get Started" text overlay
- Terminal window silhouette in corner
- GitHub-style tech aesthetic
- 16:9 aspect ratio`;

  try {
    const data = await generateImage(prompt, '16:9', '2K');
    saveImage(data, path.join(OUTPUT_DIR, 'outro', 'outro-cta-bg.jpeg'));
  } catch (error) {
    console.error(`  ✗ Failed: ${error}`);
  }
}

async function main() {
  console.log('🎬 Video Asset Generator for Agent Ready');
  console.log('=========================================');
  console.log(`Output: ${OUTPUT_DIR}\n`);

  if (!GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY environment variable required');
    process.exit(1);
  }

  // Create output directories
  ['intro', 'badges', 'pillars', 'transitions', 'outro'].forEach(dir => {
    const fullPath = path.join(OUTPUT_DIR, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });

  const startTime = Date.now();

  await generateIntroBackgrounds();
  await generateAnimatedBadges();
  await generatePillarIcons();
  await generateTransitionFrames();
  await generateOutroAssets();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Done! Generated video assets in ${elapsed}s`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
