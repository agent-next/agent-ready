# Image Generation with Nano Banana Pro

This document describes how to use the Gemini 3 Pro Image (Nano Banana Pro) API to generate images for the Agent Ready project.

## Prerequisites

1. **API Key**: You need a Gemini API key with image generation access
   - Get one from [Google AI Studio](https://aistudio.google.com/)
   - Requires Google AI Pro ($19.99/mo) or Ultra ($249.99/mo) tier for higher resolution

2. **Dependencies**: The scripts use `tsx` for TypeScript execution
   ```bash
   npm install -D tsx
   ```

## Scripts

### Single Image Generation

Generate individual images for testing or specific needs:

```bash
# Set your API key
export GEMINI_API_KEY="your-api-key"

# Generate a level badge
npx tsx scripts/generate-single-image.ts badge <level> [size]
# level: 1-5
# size: sm (128px), md (256px), lg (512px)

# Examples:
npx tsx scripts/generate-single-image.ts badge 3 lg
npx tsx scripts/generate-single-image.ts badge 5 md

# Generate an OG image
npx tsx scripts/generate-single-image.ts og <repo> <level> <score>
# repo: repository name
# level: 1-5
# score: 0-100

# Example:
npx tsx scripts/generate-single-image.ts og "my-org/my-repo" 4 85

# Generate a hero banner
npx tsx scripts/generate-single-image.ts hero <theme> <title>
# theme: dark or light
# title: banner title text

# Example:
npx tsx scripts/generate-single-image.ts hero dark "Agent Ready"
```

### Batch Image Generation

Generate all project images at once:

```bash
export GEMINI_API_KEY="your-api-key"
npx tsx scripts/generate-images.ts
```

This generates:
- **Level Badges** (L1-L5) in sm/md/lg sizes - 15 images
- **Hero Banners** (dark/light themes) - 3 images
- **OG Images** (sample social share images) - 3 images
- **Marketing Assets** (infographics, mockups) - 4 images
- **App Icons** (512px, 32px favicon) - 2 images
- **Pillar Icons** (9 pillars) - 9 images

Output is saved to `generated-images/` directory.

## API Configuration

### Resolution Tiers

| Tier | Resolution | Access Level |
|------|------------|--------------|
| 1K | 1024x1024 max | All tiers |
| 2K | 2048x2048 max | Pro/Ultra |
| 4K | 4096x4096 max | Ultra only |

### Rate Limits

| Tier | RPM | TPM | Daily Limit |
|------|-----|-----|-------------|
| Free | 2 | 32K | 50 images |
| Pro | 10 | 2M | 1,500 images |
| Ultra | 30 | 10M | Unlimited |

## API Format

The Gemini Image API uses this request format:

```typescript
{
  contents: [{ parts: [{ text: "your prompt" }] }],
  generationConfig: {
    responseModalities: ['TEXT', 'IMAGE'],
    imageConfig: {
      aspectRatio: '1:1',  // or '16:9', '1.91:1', '21:9', '3:4'
      imageSize: '1K'      // or '2K', '4K'
    }
  }
}
```

### Important Notes

- Use `imageConfig` (not `imageDimensions`)
- Use `imageSize` (not `resolution`)
- Use uppercase `['TEXT', 'IMAGE']` for responseModalities

## Prompt Guidelines

For best results:

1. **Be specific** about colors, dimensions, and style
2. **Include branding** elements like "Agent Ready"
3. **Specify use case** (OG image, badge, etc.)
4. **Describe visual elements** in detail
5. **Mention size optimization** for intended display

## Generated Image Types

### Level Badges
Circular badges showing maturity level (L1-L5) with:
- Level-specific colors (red→orange→yellow→green→blue)
- "L{n}" text in center
- Level name curved at bottom
- Star indicators

### OG Images
Social share images (1200x630) with:
- Repository name
- Level indicator
- Score percentage
- Radar chart preview
- "Agent Ready" branding

### Hero Banners
Landing page banners (21:9) with:
- Dark/light theme options
- Abstract AI/code visualizations
- Space for text overlay

## Troubleshooting

### "Invalid JSON payload" Error
Check that you're using the correct field names:
- `imageConfig` not `imageDimensions`
- `imageSize` not `resolution`

### "No image in response" Error
- Check API key is valid
- Verify tier access for requested resolution
- Simplify prompt if too complex

### Rate Limit Errors
- Wait for cooldown period
- Upgrade tier for higher limits
- Batch requests with delays
