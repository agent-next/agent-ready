# Nano Banana Pro (Gemini 3 Pro Image) - Best Practices Guide

This guide covers best practices for using Gemini 3 Pro Image (Nano Banana Pro) to generate images for the agent-ready project, particularly for Remotion video backgrounds.

## API Configuration

### Correct Model Endpoint

```typescript
const GEMINI_IMAGE_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent';
```

### Required API Format

```typescript
const response = await fetch(`${GEMINI_IMAGE_API}?key=${GEMINI_API_KEY}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],  // Must be uppercase
      imageConfig: {
        aspectRatio: '16:9',  // Valid: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
        imageSize: '1024',    // Options: 512, 1024
      },
    },
  }),
});
```

### Valid Aspect Ratios

| Ratio | Use Case |
|-------|----------|
| `16:9` | Video backgrounds, hero images |
| `1:1` | Icons, badges, social media |
| `9:16` | Mobile/portrait content |
| `4:3` | Standard images |
| `21:9` | Ultra-wide banners |

## Image Generation Best Practices

### For Video Backgrounds - CRITICAL

**ALWAYS include these phrases in prompts:**
- `NO TEXT NO LETTERS NO WORDS NO CODE NO NUMBERS`
- `purely abstract`
- `professional video background`

**Why?** AI models often add decorative text to images. This conflicts with video overlays.

### Good Prompt Example (Video Background)

```
Abstract deep space nebula background, dark indigo and purple gradients,
soft glowing stars, NO TEXT NO LETTERS NO WORDS NO CODE,
purely abstract cosmic atmosphere, subtle particle effects,
professional video background, 8K quality
```

### Bad Prompt Example

```
Tech background with code snippets and "Get Started" text
```
*This will generate text baked into the image that conflicts with video content.*

### Prompt Categories

#### Cosmic/Space Backgrounds
```
Abstract deep space nebula, dark indigo and purple gradients,
soft glowing stars, NO TEXT, purely abstract, professional video background
```

#### Neural Network/Tech
```
Abstract neural network visualization, dark blue background,
soft glowing nodes connected by thin luminous lines,
NO TEXT NO CODE, purely abstract geometric pattern
```

#### Circuit Board
```
Abstract circuit board pattern, dark navy background,
thin glowing blue lines forming circuit traces,
NO TEXT NO NUMBERS, purely abstract tech aesthetic
```

#### Gradient/Abstract
```
Abstract horizontal gradient layers, dark teal to indigo transition,
soft geometric shapes, NO TEXT, purely abstract minimalist design
```

#### Radiant/CTA
```
Abstract radiant light burst, dark purple center fading to indigo edges,
soft glowing rays emanating from center, NO TEXT, purely abstract
```

## Remotion Integration

### Using Generated Images

```typescript
import { Img, staticFile } from 'remotion';

// Place images in public/generated-v2/
const background = staticFile('generated-v2/intro/cosmic-bg.jpeg');

// Use Remotion's Img component (NOT native <img>)
<Img
  src={background}
  style={{
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.4,  // Keep subtle for video backgrounds
  }}
/>
```

### Recommended Opacity Levels

| Scene Type | Opacity | Reason |
|------------|---------|--------|
| Intro | 0.35 | Balance with particles and logo |
| Content scenes | 0.20-0.30 | Text readability |
| Outro/CTA | 0.40 | More visual impact |

### Animation Best Practices

All animations MUST use `useCurrentFrame()` - CSS transitions are FORBIDDEN in Remotion:

```typescript
const frame = useCurrentFrame();
const { fps } = useVideoConfig();

// Parallax movement
const translateY = frame * 0.05;

// Breathing scale
const scale = 1.05 + Math.sin((frame / fps) * Math.PI * 0.5) * 0.02;
```

## Directory Structure

```
video-project/
├── public/
│   └── generated-v2/           # Clean AI backgrounds
│       ├── intro/
│       │   └── cosmic-bg.jpeg
│       ├── pillars/
│       │   └── neural-bg.jpeg
│       ├── levels/
│       │   └── gradient-bg.jpeg
│       ├── cli/
│       │   └── circuit-bg.jpeg
│       └── outro/
│           └── radiant-bg.jpeg
├── src/
│   └── AgentReady/
│       ├── GeneratedAssetsV2.tsx  # Asset paths & components
│       ├── IntroSceneV2.tsx
│       ├── PillarsSceneV2.tsx
│       ├── LevelsSceneV2.tsx
│       ├── CLISceneV2.tsx
│       ├── OutroSceneV2.tsx
│       └── AgentReadyVideoV2.tsx
```

## Generation Scripts

### generate-clean-backgrounds.ts

Located at `scripts/generate-clean-backgrounds.ts`:
- Generates 5 scene-specific backgrounds
- Uses explicit "NO TEXT" prompts
- Outputs to `video-project/public/generated-v2/`

Run with:
```bash
npx tsx scripts/generate-clean-backgrounds.ts
```

## Video Rendering

### Build
```bash
cd video-project
npm run build
```

### Render V2 Video
```bash
npx remotion render AgentReadyPromoV2 out/agent-ready-v2.mp4 --codec=h264
```

### Available Compositions

| ID | Description |
|----|-------------|
| `AgentReadyPromoV2` | Enhanced with clean Gemini 3 backgrounds |
| `AgentReadyPromo` | Original version |
| `AgentReadyPromoEnhanced` | First enhanced attempt (has issues) |

## Troubleshooting

### "Model not found" Error
Use the correct model: `gemini-3-pro-image-preview` (not `gemini-2.0-flash-preview-image-generation`)

### Text appearing in generated images
Add explicit exclusions to prompt:
```
NO TEXT NO LETTERS NO WORDS NO CODE NO NUMBERS
```

### Images too busy for backgrounds
- Lower opacity (0.2-0.4)
- Add dark overlay gradient
- Use prompts with "subtle" and "minimal"

### API Rate Limiting
Add delays between requests:
```typescript
await new Promise(r => setTimeout(r, 2000));  // 2 seconds between calls
```

## Environment Setup

Required environment variable:
```bash
export GEMINI_API_KEY=your_api_key_here
```

## Website Integration

### Generated Assets

Run to generate website assets:
```bash
npx tsx scripts/generate-website-assets.ts
```

Output to `agent-ready-website/public/generated/`:
- `hero-bg.jpeg` - Neural network hero background (21:9)
- `og-image.jpeg` - Social media preview image (16:9)
- `cta-bg.jpeg` - Call-to-action section background (21:9)

### Using in React

```tsx
{/* Hero background */}
<div
  className="absolute inset-0 -z-10 opacity-40"
  style={{
    backgroundImage: 'url(/generated/hero-bg.jpeg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
/>
```

## Files to Keep Local (.gitignore)

```
# Nano Banana Pro image generation (local only)
scripts/generate-images.ts
scripts/generate-single-image.ts
scripts/generate-video-assets.ts
scripts/generate-clean-backgrounds.ts
scripts/generate-website-assets.ts
docs/NANO-BANANA-PRO-GUIDE.md
video-project/public/generated/
video-project/public/generated-v2/
```

## Summary

1. **Always use explicit "NO TEXT" in prompts** for video backgrounds
2. **Use correct API format**: `imageConfig` (not `imageDimensions`)
3. **Use Remotion's Img component** (not native `<img>`)
4. **Keep backgrounds subtle** (opacity 0.2-0.4)
5. **Drive all animations with useCurrentFrame()** (no CSS transitions)
