/**
 * Image Generation Service using Nano Banana Pro (Gemini 3 Pro Image)
 *
 * Generates images for:
 * - OG/Social share images for scan results
 * - Marketing hero banners
 * - L1-L5 level badges/certificates
 */

import { config } from '../config.js';

export interface ImageGenerationRequest {
  type: 'og' | 'badge' | 'hero' | 'certificate';
  params: OGImageParams | BadgeParams | HeroParams | CertificateParams;
}

export interface OGImageParams {
  repoName: string;
  level: number;
  score: number;
  headline: string;
  pillars?: { name: string; score: number }[];
}

export interface BadgeParams {
  level: number;
  size?: 'sm' | 'md' | 'lg';
}

export interface HeroParams {
  theme: 'dark' | 'light';
  title: string;
  subtitle?: string;
}

export interface CertificateParams {
  repoName: string;
  level: number;
  score: number;
  date: string;
  pillars: { name: string; level: number }[];
}

export interface GeneratedImage {
  data: string; // base64
  mimeType: string;
  resolution: string;
}

// Nano Banana Pro API endpoint
const GEMINI_IMAGE_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent';

// Level colors for visual design
const LEVEL_COLORS: Record<number, { primary: string; accent: string; name: string }> = {
  1: { primary: '#ef4444', accent: '#fca5a5', name: 'Functional' },
  2: { primary: '#f97316', accent: '#fdba74', name: 'Documented' },
  3: { primary: '#eab308', accent: '#fde047', name: 'Standardized' },
  4: { primary: '#22c55e', accent: '#86efac', name: 'Optimized' },
  5: { primary: '#3b82f6', accent: '#93c5fd', name: 'Autonomous' },
};

/**
 * Generate an image using Nano Banana Pro
 */
export async function generateImage(request: ImageGenerationRequest): Promise<GeneratedImage> {
  const prompt = buildPrompt(request);
  const resolution = getResolution(request.type);

  const response = await fetch(`${GEMINI_IMAGE_API}?key=${config.geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: getAspectRatio(request.type),
          imageSize: resolution,
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Image generation failed: ${error.error?.message || response.statusText}`);
  }

  const result = await response.json();

  // Extract image from response
  const imagePart = result.candidates?.[0]?.content?.parts?.find(
    (part: { inlineData?: { mimeType: string; data: string } }) => part.inlineData
  );

  if (!imagePart?.inlineData) {
    throw new Error('No image generated');
  }

  return {
    data: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType,
    resolution,
  };
}

/**
 * Build the prompt for image generation based on type
 */
function buildPrompt(request: ImageGenerationRequest): string {
  switch (request.type) {
    case 'og':
      return buildOGPrompt(request.params as OGImageParams);
    case 'badge':
      return buildBadgePrompt(request.params as BadgeParams);
    case 'hero':
      return buildHeroPrompt(request.params as HeroParams);
    case 'certificate':
      return buildCertificatePrompt(request.params as CertificateParams);
    default:
      throw new Error(`Unknown image type: ${request.type}`);
  }
}

function buildOGPrompt(params: OGImageParams): string {
  const levelInfo = LEVEL_COLORS[params.level] || LEVEL_COLORS[1];
  const pillarText = params.pillars
    ?.map((p) => `${p.name}: ${p.score}%`)
    .join(', ');

  return `Create a professional Open Graph social share image for a code repository analysis tool.

Design specifications:
- Modern, tech-focused design with dark gradient background (slate-900 to slate-800)
- Repository name "${params.repoName}" prominently displayed in white
- Large level indicator "L${params.level}" with ${levelInfo.primary} accent color
- Score "${params.score}%" displayed with circular progress indicator
- Headline text: "${params.headline}"
- Small radar chart or bar visualization showing pillar scores: ${pillarText || 'Documentation, Code Style, Testing, Security'}
- "Agent Ready" branding in bottom corner with subtle glow effect
- Clean, minimalist tech aesthetic similar to GitHub or Vercel OG images
- No placeholder text, use actual values provided
- Professional typography with good contrast`;
}

function buildBadgePrompt(params: BadgeParams): string {
  const levelInfo = LEVEL_COLORS[params.level] || LEVEL_COLORS[1];
  const size = params.size || 'md';
  const dimensions = size === 'sm' ? '128x128' : size === 'lg' ? '512x512' : '256x256';

  return `Create a circular badge/shield icon for software maturity certification.

Design specifications:
- Circular badge shape with metallic/glossy finish
- Primary color: ${levelInfo.primary}, accent: ${levelInfo.accent}
- Large "L${params.level}" text in center
- "${levelInfo.name}" text curved along bottom edge
- Subtle circuit board or code pattern in background
- Small star/checkmark decorations based on level (${params.level} stars)
- Glowing edge effect in accent color
- Transparent or solid background suitable for embedding
- Size optimized for ${dimensions} pixels
- Clean, professional certification badge aesthetic`;
}

function buildHeroPrompt(params: HeroParams): string {
  const isDark = params.theme === 'dark';

  return `Create a hero banner illustration for a developer tools landing page.

Design specifications:
- ${isDark ? 'Dark gradient background (slate-900 to indigo-900)' : 'Light gradient background (white to slate-100)'}
- Abstract representation of AI agents working with code
- Floating code snippets, terminal windows, and git icons
- Subtle grid pattern suggesting structure and organization
- Glowing nodes and connections representing AI analysis
- ${isDark ? 'Neon blue and purple accents' : 'Soft blue and green accents'}
- Modern, minimalist tech illustration style
- Title area left clear for text overlay: "${params.title}"
${params.subtitle ? `- Subtitle space for: "${params.subtitle}"` : ''}
- Professional SaaS/DevTools aesthetic
- Wide aspect ratio suitable for hero section`;
}

function buildCertificatePrompt(params: CertificateParams): string {
  const levelInfo = LEVEL_COLORS[params.level] || LEVEL_COLORS[1];
  const pillarList = params.pillars.map((p) => `${p.name}: L${p.level}`).join('\n');

  return `Create a professional certificate of achievement for code repository maturity.

Design specifications:
- Elegant certificate design with subtle parchment/paper texture
- Dark slate header bar with "Agent Ready Certification" title
- Large decorative seal/badge showing "L${params.level} - ${levelInfo.name}" in ${levelInfo.primary}
- Repository name "${params.repoName}" in prominent serif font
- Overall score "${params.score}%" with star rating (${params.level}/5 stars filled)
- Date issued: "${params.date}"
- Pillar breakdown section:
${pillarList}
- Decorative border with subtle tech/code motifs
- QR code placeholder in corner
- "Verified by Agent Ready" footer with logo
- Professional, frameable certificate aesthetic
- Portrait orientation`;
}

function getAspectRatio(type: string): string {
  switch (type) {
    case 'og':
      return '1.91:1'; // Standard OG image ratio
    case 'badge':
      return '1:1';
    case 'hero':
      return '21:9';
    case 'certificate':
      return '3:4';
    default:
      return '16:9';
  }
}

function getResolution(type: string): string {
  // Use 2K for most, 4K for certificates (Ultra tier required)
  switch (type) {
    case 'certificate':
      return '4K';
    case 'hero':
      return '2K';
    default:
      return '1K';
  }
}

/**
 * Generate OG image for scan results
 */
export async function generateOGImage(params: OGImageParams): Promise<GeneratedImage> {
  return generateImage({ type: 'og', params });
}

/**
 * Generate level badge
 */
export async function generateBadge(level: number, size?: 'sm' | 'md' | 'lg'): Promise<GeneratedImage> {
  return generateImage({ type: 'badge', params: { level, size } });
}

/**
 * Generate hero banner
 */
export async function generateHero(params: HeroParams): Promise<GeneratedImage> {
  return generateImage({ type: 'hero', params });
}

/**
 * Generate certificate
 */
export async function generateCertificate(params: CertificateParams): Promise<GeneratedImage> {
  return generateImage({ type: 'certificate', params });
}
