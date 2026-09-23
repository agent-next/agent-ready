/**
 * Generate Website Assets with Gemini 3 Pro Image
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_IMAGE_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent';

async function generateImage(prompt: string, aspectRatio: string, filename: string): Promise<void> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY required');
  }

  console.log(`Generating: ${filename}`);

  const response = await fetch(`${GEMINI_IMAGE_API}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio, imageSize: '1024' },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${await response.text()}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      fs.writeFileSync(filename, Buffer.from(part.inlineData.data, 'base64'));
      console.log(`✓ Saved: ${filename}`);
      return;
    }
  }

  throw new Error('No image in response');
}

async function main() {
  const outputDir = path.join(__dirname, '../../agent-ready-website/public/generated');
  fs.mkdirSync(outputDir, { recursive: true });

  const assets = [
    // Hero background
    {
      name: 'hero-bg.jpeg',
      aspectRatio: '21:9',
      prompt: 'Abstract futuristic technology background, deep blue and purple gradient, glowing neural network nodes and connections, NO TEXT NO LETTERS NO WORDS NO CODE, purely abstract, subtle particle effects, professional website hero background, 8K quality'
    },
    // OG image
    {
      name: 'og-image.jpeg',
      aspectRatio: '16:9',
      prompt: 'Modern tech brand image with abstract hexagonal patterns, deep blue and indigo colors, glowing geometric shapes, NO TEXT NO LETTERS NO WORDS, purely abstract, professional social media preview, clean and minimal, 8K quality'
    },
    // CTA background
    {
      name: 'cta-bg.jpeg',
      aspectRatio: '21:9',
      prompt: 'Abstract radiant light burst on dark background, purple and blue rays emanating from center, NO TEXT NO LETTERS NO WORDS NO CODE, purely abstract, professional call-to-action section background, 8K quality'
    },
  ];

  for (const asset of assets) {
    try {
      await generateImage(
        asset.prompt,
        asset.aspectRatio,
        path.join(outputDir, asset.name)
      );
      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      console.error(`Failed: ${asset.name}`, error);
    }
  }

  console.log('\n✅ Website assets generated in:', outputDir);
}

main().catch(console.error);
