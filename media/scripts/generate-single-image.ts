#!/usr/bin/env npx tsx
/**
 * Generate a single image using Nano Banana Pro
 *
 * Usage:
 *   GEMINI_API_KEY=xxx npx tsx scripts/generate-single-image.ts <type> [options]
 *
 * Types:
 *   badge <level> [size]     - Generate level badge (level: 1-5, size: sm/md/lg)
 *   og <repo> <level> <score> - Generate OG image
 *   hero <theme> <title>     - Generate hero banner (theme: dark/light)
 *
 * Examples:
 *   npx tsx scripts/generate-single-image.ts badge 3 lg
 *   npx tsx scripts/generate-single-image.ts og "my-repo" 4 85
 *   npx tsx scripts/generate-single-image.ts hero dark "Agent Ready"
 */

import * as fs from 'fs';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_IMAGE_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent';

const LEVELS: Record<number, { name: string; color: string; accent: string }> = {
  1: { name: 'Functional', color: '#ef4444', accent: '#fca5a5' },
  2: { name: 'Documented', color: '#f97316', accent: '#fdba74' },
  3: { name: 'Standardized', color: '#eab308', accent: '#fde047' },
  4: { name: 'Optimized', color: '#22c55e', accent: '#86efac' },
  5: { name: 'Autonomous', color: '#3b82f6', accent: '#93c5fd' },
};

async function generateImage(prompt: string, aspectRatio: string, resolution: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable required');
  }

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
    (part: { inlineData?: { data: string } }) => part.inlineData
  );

  if (!imagePart?.inlineData) {
    throw new Error('No image in response');
  }

  return imagePart.inlineData.data;
}

async function generateBadge(level: number, size: 'sm' | 'md' | 'lg' = 'md') {
  const info = LEVELS[level] || LEVELS[1];
  const pixels = size === 'sm' ? 128 : size === 'lg' ? 512 : 256;

  const prompt = `Create a circular badge/shield for software maturity certification.

Design:
- Circular metallic badge
- Primary: ${info.color}, Accent: ${info.accent}
- "L${level}" centered, bold
- "${info.name}" curved at bottom
- ${level} stars at top
- Circuit pattern background
- Glowing edge
- ${pixels}px size`;

  console.log(`Generating L${level} badge (${size})...`);
  const data = await generateImage(prompt, '1:1', size === 'lg' ? '2K' : '1K');

  const filename = `badge-L${level}-${size}.png`;
  fs.writeFileSync(filename, Buffer.from(data, 'base64'));
  console.log(`✓ Saved: ${filename}`);
}

async function generateOG(repo: string, level: number, score: number) {
  const info = LEVELS[level] || LEVELS[1];

  const prompt = `Create an OG social share image for code analysis tool.

Design:
- Dark gradient (slate-900 to slate-800)
- "${repo}" in white, prominent
- "L${level}" with ${info.color} accent
- "${score}%" with circular progress
- Small radar chart
- "Agent Ready" branding
- Tech aesthetic like GitHub
- 1200x630 pixels`;

  console.log(`Generating OG image for ${repo}...`);
  const data = await generateImage(prompt, '16:9', '1K');

  // Sanitize filename: remove path traversal, special chars, and normalize
  const sanitized = repo
    .replace(/\.\./g, '')           // Remove path traversal
    .replace(/[\/\\]/g, '-')        // Replace slashes with dashes
    .replace(/[^a-zA-Z0-9\-_.]/g, '') // Keep only safe characters
    .replace(/^-+|-+$/g, '')        // Trim leading/trailing dashes
    .substring(0, 100);             // Limit length
  const filename = `og-${sanitized || 'repo'}.png`;
  fs.writeFileSync(filename, Buffer.from(data, 'base64'));
  console.log(`✓ Saved: ${filename}`);
}

async function generateHeroImage(theme: 'dark' | 'light', title: string) {
  const isDark = theme === 'dark';

  const prompt = `Create hero banner for developer tools landing page.

Design:
- ${isDark ? 'Dark gradient (slate-900 to indigo-900)' : 'Light gradient (white to slate-100)'}
- Abstract AI agents with code
- Floating terminal windows, git icons
- Glowing nodes and connections
- ${isDark ? 'Neon blue/purple' : 'Soft blue/green'} accents
- Space for "${title}" text
- Wide 21:9 ratio`;

  console.log(`Generating ${theme} hero...`);
  const data = await generateImage(prompt, '21:9', '2K');

  const filename = `hero-${theme}.png`;
  fs.writeFileSync(filename, Buffer.from(data, 'base64'));
  console.log(`✓ Saved: ${filename}`);
}

async function main() {
  const [, , type, ...args] = process.argv;

  if (!type || !GEMINI_API_KEY) {
    console.log(`
Usage: GEMINI_API_KEY=xxx npx tsx scripts/generate-single-image.ts <type> [options]

Types:
  badge <level> [size]      - Level badge (1-5, sm/md/lg)
  og <repo> <level> <score> - OG share image
  hero <theme> <title>      - Hero banner (dark/light)

Examples:
  npx tsx scripts/generate-single-image.ts badge 3 lg
  npx tsx scripts/generate-single-image.ts og my-repo 4 85
  npx tsx scripts/generate-single-image.ts hero dark "Agent Ready"
`);
    process.exit(1);
  }

  try {
    switch (type) {
      case 'badge':
        await generateBadge(parseInt(args[0]) || 3, (args[1] as 'sm' | 'md' | 'lg') || 'md');
        break;
      case 'og':
        await generateOG(args[0] || 'repo', parseInt(args[1]) || 3, parseInt(args[2]) || 75);
        break;
      case 'hero':
        await generateHeroImage((args[0] as 'dark' | 'light') || 'dark', args[1] || 'Agent Ready');
        break;
      default:
        console.error(`Unknown type: ${type}`);
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
