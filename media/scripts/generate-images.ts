#!/usr/bin/env npx tsx
/**
 * Generate all images for Agent Ready project
 *
 * Usage:
 *   GEMINI_API_KEY=xxx npx tsx scripts/generate-images.ts
 *
 * Generates:
 *   - Level badges (L1-L5) in multiple sizes
 *   - Hero banners (dark/light themes)
 *   - Sample OG images
 *   - Marketing assets
 */

import * as fs from 'fs';
import * as path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_IMAGE_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent';

// Output directories
const OUTPUT_BASE = path.join(process.cwd(), 'generated-images');
const DIRS = {
  badges: path.join(OUTPUT_BASE, 'badges'),
  heroes: path.join(OUTPUT_BASE, 'heroes'),
  og: path.join(OUTPUT_BASE, 'og'),
  marketing: path.join(OUTPUT_BASE, 'marketing'),
  icons: path.join(OUTPUT_BASE, 'icons'),
};

// Level definitions
const LEVELS = [
  { level: 1, name: 'Functional', color: '#ef4444', accent: '#fca5a5' },
  { level: 2, name: 'Documented', color: '#f97316', accent: '#fdba74' },
  { level: 3, name: 'Standardized', color: '#eab308', accent: '#fde047' },
  { level: 4, name: 'Optimized', color: '#22c55e', accent: '#86efac' },
  { level: 5, name: 'Autonomous', color: '#3b82f6', accent: '#93c5fd' },
];

// Pillar definitions
const PILLARS = [
  { name: 'Documentation', icon: '📖' },
  { name: 'Code Style', icon: '✨' },
  { name: 'Build System', icon: '🔧' },
  { name: 'Testing', icon: '🧪' },
  { name: 'Security', icon: '🔒' },
  { name: 'Observability', icon: '📊' },
  { name: 'Environment', icon: '🌍' },
  { name: 'Task Discovery', icon: '📋' },
  { name: 'Product', icon: '🚀' },
];

interface GeneratedImage {
  data: string;
  mimeType: string;
}

async function generateImage(prompt: string, aspectRatio: string = '1:1', resolution: string = '1K'): Promise<GeneratedImage> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable required');
  }

  console.log(`  Generating image...`);

  const response = await fetch(`${GEMINI_IMAGE_API}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio, imageSize: resolution },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`API error: ${error.error?.message || response.statusText}`);
  }

  const result = await response.json();
  const imagePart = result.candidates?.[0]?.content?.parts?.find(
    (part: { inlineData?: { mimeType: string; data: string } }) => part.inlineData
  );

  if (!imagePart?.inlineData) {
    throw new Error('No image in response');
  }

  return {
    data: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType,
  };
}

function saveImage(image: GeneratedImage, filePath: string) {
  const ext = image.mimeType.split('/')[1] || 'png';
  const fullPath = filePath.endsWith(`.${ext}`) ? filePath : `${filePath}.${ext}`;
  fs.writeFileSync(fullPath, Buffer.from(image.data, 'base64'));
  console.log(`  ✓ Saved: ${fullPath}`);
}

function ensureDirs() {
  Object.values(DIRS).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// =====================
// Image Generators
// =====================

async function generateBadges() {
  console.log('\n📛 Generating Level Badges...');

  for (const level of LEVELS) {
    console.log(`\n  Level ${level.level} - ${level.name}`);

    for (const size of ['sm', 'md', 'lg'] as const) {
      const pixels = size === 'sm' ? 128 : size === 'lg' ? 512 : 256;

      const prompt = `Create a circular badge/shield icon for software maturity certification.

Design:
- Circular badge with metallic/glossy finish
- Primary color: ${level.color}, accent: ${level.accent}
- Large "L${level.level}" in center, bold sans-serif
- "${level.name}" curved along bottom
- Subtle circuit/code pattern background
- ${level.level} small stars at top
- Glowing edge effect
- Clean, professional look
- Size: ${pixels}x${pixels} pixels`;

      try {
        const image = await generateImage(prompt, '1:1', size === 'lg' ? '2K' : '1K');
        saveImage(image, path.join(DIRS.badges, `badge-L${level.level}-${size}`));
      } catch (error) {
        console.error(`  ✗ Failed: ${error}`);
      }
    }
  }
}

async function generateHeroes() {
  console.log('\n🎨 Generating Hero Banners...');

  const heroConfigs = [
    {
      name: 'hero-dark',
      theme: 'dark',
      title: 'Agent Ready',
      subtitle: 'Evaluate your repository readiness for AI agents',
    },
    {
      name: 'hero-light',
      theme: 'light',
      title: 'Agent Ready',
      subtitle: 'Evaluate your repository readiness for AI agents',
    },
    {
      name: 'hero-scan',
      theme: 'dark',
      title: 'Scan Your Repository',
      subtitle: '9 Pillars • 5 Levels • AI-Powered Analysis',
    },
  ];

  for (const config of heroConfigs) {
    console.log(`\n  ${config.name}`);

    const isDark = config.theme === 'dark';
    const prompt = `Create a hero banner for a developer tools landing page.

Design:
- ${isDark ? 'Dark gradient (slate-900 to indigo-900)' : 'Light gradient (white to slate-100)'}
- Abstract AI agents working with code visualization
- Floating code snippets, terminal windows, git icons
- Subtle grid pattern
- Glowing nodes and connections
- ${isDark ? 'Neon blue/purple accents' : 'Soft blue/green accents'}
- Modern SaaS aesthetic
- Wide 21:9 aspect ratio
- Leave clear space for text: "${config.title}"
${config.subtitle ? `- Subtitle: "${config.subtitle}"` : ''}`;

    try {
      const image = await generateImage(prompt, '21:9', '2K');
      saveImage(image, path.join(DIRS.heroes, config.name));
    } catch (error) {
      console.error(`  ✗ Failed: ${error}`);
    }
  }
}

async function generateOGImages() {
  console.log('\n🖼️ Generating OG Images...');

  const ogConfigs = [
    {
      name: 'og-default',
      repoName: 'your-repo',
      level: 3,
      score: 75,
      headline: 'Your repository is Standardized',
    },
    {
      name: 'og-sample-L1',
      repoName: 'legacy-project',
      level: 1,
      score: 32,
      headline: 'Getting started on the Agent-Ready journey',
    },
    {
      name: 'og-sample-L5',
      repoName: 'super-repo',
      level: 5,
      score: 95,
      headline: 'Fully autonomous and AI-ready!',
    },
  ];

  for (const config of ogConfigs) {
    console.log(`\n  ${config.name}`);

    const levelInfo = LEVELS.find((l) => l.level === config.level)!;
    const prompt = `Create a professional Open Graph social share image for a code repository analysis tool.

Design:
- Dark gradient background (slate-900 to slate-800)
- Repository name "${config.repoName}" in white, prominent
- Large "L${config.level}" indicator with ${levelInfo.color} accent
- Score "${config.score}%" with circular progress
- Headline: "${config.headline}"
- Small radar chart showing 9 pillar scores
- "Agent Ready" branding in corner
- Clean tech aesthetic like GitHub/Vercel
- 16:9 aspect ratio (close to OG standard 1200x630)`;

    try {
      const image = await generateImage(prompt, '16:9', '1K');
      saveImage(image, path.join(DIRS.og, config.name));
    } catch (error) {
      console.error(`  ✗ Failed: ${error}`);
    }
  }
}

async function generateMarketingAssets() {
  console.log('\n📢 Generating Marketing Assets...');

  const assets = [
    {
      name: 'pillars-infographic',
      prompt: `Create an infographic showing 9 pillars of software maturity.

Design:
- Dark background with subtle gradient
- 9 hexagonal icons arranged in 3x3 grid
- Each pillar: Documentation 📖, Code Style ✨, Build System 🔧, Testing 🧪, Security 🔒, Observability 📊, Environment 🌍, Task Discovery 📋, Product 🚀
- Connecting lines between related pillars
- "9 Pillars of Agent Readiness" title
- Modern, clean tech infographic style
- Square 1:1 aspect ratio`,
      aspect: '1:1',
    },
    {
      name: 'levels-progression',
      prompt: `Create an infographic showing 5 maturity levels as ascending steps.

Design:
- Dark gradient background
- 5 ascending platforms/steps from left to right
- L1 (red) → L2 (orange) → L3 (yellow) → L4 (green) → L5 (blue)
- Labels: Functional, Documented, Standardized, Optimized, Autonomous
- Small robot/agent icon climbing the steps
- Progress arrow flowing upward
- "5 Levels of Agent Readiness" title
- Wide 16:9 aspect ratio`,
      aspect: '16:9',
    },
    {
      name: 'scan-preview',
      prompt: `Create a mockup of a terminal showing an agent-ready scan in progress.

Design:
- Dark terminal window with rounded corners
- Green/blue command text showing "agent-ready scan ."
- ASCII art progress bars for each pillar
- Partial scan results visible
- Realistic terminal aesthetic
- Subtle glow effects
- "Scanning your repository..." status
- 16:9 aspect ratio`,
      aspect: '16:9',
    },
    {
      name: 'comparison-github',
      prompt: `Create a split-screen comparison infographic.

Design:
- Left side: "Before Agent-Ready" - cluttered, disorganized code icons, red X marks
- Right side: "After Agent-Ready" - organized, structured, green checkmarks
- Dark background
- Clear dividing line with arrow transformation
- "Transform Your Repository" tagline
- Modern comparison layout
- 16:9 aspect ratio`,
      aspect: '16:9',
    },
  ];

  for (const asset of assets) {
    console.log(`\n  ${asset.name}`);

    try {
      const image = await generateImage(asset.prompt, asset.aspect, '2K');
      saveImage(image, path.join(DIRS.marketing, asset.name));
    } catch (error) {
      console.error(`  ✗ Failed: ${error}`);
    }
  }
}

async function generateIcons() {
  console.log('\n🎯 Generating App Icons...');

  const iconConfigs = [
    { name: 'app-icon', size: 512 },
    { name: 'favicon', size: 32 },
  ];

  for (const config of iconConfigs) {
    console.log(`\n  ${config.name} (${config.size}px)`);

    const prompt = `Create an app icon for "Agent Ready" - an AI agent readiness scanner.

Design:
- Square icon with rounded corners
- Dark gradient background (slate-800 to indigo-900)
- Central "AR" monogram or stylized checkmark/robot icon
- Subtle circuit board pattern
- Blue/purple accent glow
- Clean, modern app icon style
- Size optimized for ${config.size}x${config.size} pixels
- Works well at small sizes`;

    try {
      const image = await generateImage(prompt, '1:1', config.size > 256 ? '2K' : '1K');
      saveImage(image, path.join(DIRS.icons, config.name));
    } catch (error) {
      console.error(`  ✗ Failed: ${error}`);
    }
  }
}

async function generatePillarIcons() {
  console.log('\n🏛️ Generating Pillar Icons...');

  for (const pillar of PILLARS) {
    console.log(`\n  ${pillar.name}`);

    const prompt = `Create a modern icon for "${pillar.name}" pillar in software maturity.

Design:
- Square icon with subtle rounded corners
- Dark slate background with gradient
- Central icon representing ${pillar.name.toLowerCase()}
- Glowing blue/purple accent
- Minimalist, flat design style
- Professional tech aesthetic
- 256x256 optimized size
- Related to: ${pillar.icon}`;

    try {
      const image = await generateImage(prompt, '1:1', '1K');
      const safeName = pillar.name.toLowerCase().replace(/\s+/g, '-');
      saveImage(image, path.join(DIRS.icons, `pillar-${safeName}`));
    } catch (error) {
      console.error(`  ✗ Failed: ${error}`);
    }
  }
}

// =====================
// Main
// =====================

async function main() {
  console.log('🎨 Agent Ready Image Generator');
  console.log('================================');

  if (!GEMINI_API_KEY) {
    console.error('\n❌ Error: GEMINI_API_KEY environment variable required');
    console.log('\nUsage:');
    console.log('  GEMINI_API_KEY=your_key npx tsx scripts/generate-images.ts');
    process.exit(1);
  }

  console.log(`\nOutput directory: ${OUTPUT_BASE}`);
  ensureDirs();

  const startTime = Date.now();

  // Run all generators
  await generateBadges();
  await generateHeroes();
  await generateOGImages();
  await generateMarketingAssets();
  await generateIcons();
  await generatePillarIcons();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Done! Generated images in ${elapsed}s`);
  console.log(`📁 Output: ${OUTPUT_BASE}`);
}

main().catch(console.error);
