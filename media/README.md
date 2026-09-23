# Agent Ready Media

Marketing and promotional assets for Agent Ready.

## Structure

```
agent-ready-media/
├── video-project/          # Remotion video project
│   ├── src/                # Video compositions
│   │   ├── AgentReady/     # Agent Ready promo scenes
│   │   └── Root.tsx        # Video entry point
│   └── public/             # Static assets for videos
├── generated-images/       # AI-generated marketing images
│   ├── badges/             # Level badges (L1-L5)
│   ├── heroes/             # Hero section backgrounds
│   ├── icons/              # Pillar icons
│   ├── marketing/          # Social media graphics
│   └── og/                 # Open Graph images
├── scripts/                # Image generation scripts
├── api-image-routes/       # API endpoints for dynamic images
└── docs/                   # Documentation
```

## Video Project

### Setup

```bash
cd video-project
npm install
```

### Development

```bash
npm run dev      # Start Remotion Studio
```

### Build

```bash
npm run build    # Bundle for production
```

### Render Video

```bash
npx remotion render AgentReadyPromo out/promo.mp4
```

## Generated Images

Images are generated using AI (Nano Banana Pro). See `docs/NANO-BANANA-PRO-GUIDE.md` for generation instructions.

## Scripts

- `generate-images.ts` - Batch generate marketing images
- `generate-video-assets.ts` - Generate video backgrounds
- `generate-website-assets.ts` - Generate website assets

## Related

- [agent-ready](../agent-ready) - Core CLI
- [agent-ready-website](../agent-ready-website) - Frontend
- [agent-ready-backend](../agent-ready-backend) - API server
