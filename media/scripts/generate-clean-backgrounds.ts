/**
 * Generate Clean Abstract Backgrounds for Video
 *
 * Key requirements:
 * - NO TEXT, NO CODE, NO LETTERS
 * - Pure abstract patterns
 * - Dark color scheme for video overlay
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_IMAGE_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent';

async function generateImage(prompt: string, filename: string): Promise<void> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable required');
  }

  console.log(`Generating: ${filename}`);
  console.log(`Prompt: ${prompt.substring(0, 80)}...`);

  const response = await fetch(`${GEMINI_IMAGE_API}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: '16:9',
          imageSize: '1024',
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${error}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      const buffer = Buffer.from(part.inlineData.data, 'base64');
      fs.writeFileSync(filename, buffer);
      console.log(`✓ Saved: ${filename}`);
      return;
    }
  }

  throw new Error('No image in response');
}

async function main() {
  const outputDir = path.join(__dirname, '../video-project/public/generated-v2');

  // Create directories
  ['intro', 'pillars', 'levels', 'cli', 'outro'].forEach(dir => {
    fs.mkdirSync(path.join(outputDir, dir), { recursive: true });
  });

  // Clean abstract backgrounds - EXPLICIT NO TEXT INSTRUCTIONS
  const backgrounds = [
    // Intro - cosmic/space theme
    {
      name: 'intro/cosmic-bg.jpeg',
      prompt: 'Abstract deep space nebula background, dark indigo and purple gradients, soft glowing stars, NO TEXT NO LETTERS NO WORDS NO CODE, purely abstract cosmic atmosphere, subtle particle effects, professional video background, 8K quality'
    },
    // Pillars - neural network/connection theme
    {
      name: 'pillars/neural-bg.jpeg',
      prompt: 'Abstract neural network visualization, dark blue background, soft glowing nodes connected by thin luminous lines, NO TEXT NO LETTERS NO WORDS NO CODE, purely abstract geometric pattern, subtle depth, professional video background, 8K quality'
    },
    // Levels - gradient steps theme
    {
      name: 'levels/gradient-bg.jpeg',
      prompt: 'Abstract horizontal gradient layers, dark teal to indigo transition, soft geometric shapes, NO TEXT NO LETTERS NO WORDS NO CODE, purely abstract minimalist design, subtle light beams, professional video background, 8K quality'
    },
    // CLI - circuit/tech theme
    {
      name: 'cli/circuit-bg.jpeg',
      prompt: 'Abstract circuit board pattern, dark navy background, thin glowing blue lines forming circuit traces, NO TEXT NO LETTERS NO WORDS NO CODE NO NUMBERS, purely abstract tech aesthetic, subtle grid pattern, professional video background, 8K quality'
    },
    // Outro - radiant/call-to-action theme
    {
      name: 'outro/radiant-bg.jpeg',
      prompt: 'Abstract radiant light burst, dark purple center fading to indigo edges, soft glowing rays emanating from center, NO TEXT NO LETTERS NO WORDS NO CODE, purely abstract dramatic lighting, professional video background, 8K quality'
    }
  ];

  const failures: string[] = [];
  let successCount = 0;

  for (const bg of backgrounds) {
    const outputPath = path.join(outputDir, bg.name);
    try {
      await generateImage(bg.prompt, outputPath);
      successCount++;
      // Rate limiting
      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Failed: ${bg.name}`, errorMsg);
      failures.push(`${bg.name}: ${errorMsg}`);
    }
  }

  // Report summary
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Results: ${successCount}/${backgrounds.length} successful`);

  if (failures.length > 0) {
    console.error('\n❌ Failed generations:');
    failures.forEach(f => console.error(`  - ${f}`));
    console.log('\n⚠️  Some backgrounds failed. Re-run to retry failed items.');
    process.exit(1);
  } else {
    console.log('\n✅ All backgrounds generated in:', outputDir);
  }
}

main().catch(console.error);
