/**
 * Share Image Component
 *
 * Generates and displays shareable OG images for scan results
 * Uses Nano Banana Pro for AI-generated images
 */

import { useState } from 'react';
import { generateOGImage, generateCertificate } from '../api/images';
import type { GeneratedImage } from '../api/images';
import type { ScanResult } from '../api/scan';

interface ShareImageProps {
  result: ScanResult;
  type?: 'og' | 'certificate';
}

export function ShareImage({ result, type = 'og' }: ShareImageProps) {
  const [image, setImage] = useState<GeneratedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateImage = async () => {
    setLoading(true);
    setError(null);

    try {
      const pillars = result.detailed_analysis.pillars.map((p) => ({
        name: p.name,
        score: p.score,
        level: p.level_achieved,
      }));

      if (type === 'og') {
        const response = await generateOGImage({
          repoName: result.meta.repo,
          level: result.executive_summary.level,
          score: result.executive_summary.score,
          headline: result.executive_summary.headline,
          pillars: pillars.map((p) => ({ name: p.name, score: p.score })),
        });

        if (response.success) {
          // Type narrowing: image is guaranteed when success === true
          setImage(response.image);
        } else {
          // Type narrowing: error is guaranteed when success === false
          setError(response.error);
        }
      } else {
        const response = await generateCertificate({
          repoName: result.meta.repo,
          level: result.executive_summary.level,
          score: result.executive_summary.score,
          pillars: pillars.map((p) => ({ name: p.name, level: p.level })),
        });

        if (response.success) {
          setImage(response.image);
        } else {
          setError(response.error);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!image) return;

    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download =
      type === 'og'
        ? `agent-ready-${result.meta.repo.replace(/\//g, '-')}.png`
        : `agent-ready-certificate-${result.meta.repo.replace(/\//g, '-')}.png`;
    link.click();
  };

  const copyToClipboard = async () => {
    if (!image) return;

    try {
      const blob = await fetch(image.dataUrl).then((r) => r.blob());
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback: copy data URL (ClipboardItem may not be supported in all browsers)
      console.warn('ClipboardItem API not supported, falling back to text copy:', err);
      try {
        await navigator.clipboard.writeText(image.dataUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (copyErr) {
        console.error('Failed to copy:', copyErr);
      }
    }
  };

  return (
    <div className="bg-bg-secondary border border-border-light rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-text-primary">
          {type === 'og' ? 'Share Image' : 'Achievement Certificate'}
        </h3>

        {!image && (
          <button
            onClick={generateImage}
            disabled={loading}
            className="px-4 py-2 bg-accent-primary hover:bg-accent-secondary disabled:bg-text-muted rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Generate Image
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-level-1/10 border border-level-1/30 rounded-lg text-level-1 text-sm">
          {error}
        </div>
      )}

      {image ? (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-lg overflow-hidden bg-bg-code">
            <img
              src={image.dataUrl}
              alt="Generated share image"
              className="w-full h-auto"
              loading="lazy"
            />
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-white/70">
              {image.resolution}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={downloadImage}
              className="flex-1 px-4 py-2 bg-level-4 hover:opacity-90 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download
            </button>

            <button
              onClick={copyToClipboard}
              className="flex-1 px-4 py-2 bg-bg-tertiary hover:bg-border-medium rounded-lg text-sm font-medium text-text-primary transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {copied ? 'Copied!' : 'Copy'}
            </button>

            <button
              onClick={() => setImage(null)}
              className="px-4 py-2 bg-bg-tertiary hover:bg-border-medium rounded-lg text-sm font-medium text-text-primary transition-colors"
            >
              Regenerate
            </button>
          </div>

          {/* Share links */}
          <div className="pt-4 border-t border-border-light">
            <p className="text-sm text-text-secondary mb-2">Share to:</p>
            <div className="flex gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `${result.meta.repo} is L${result.executive_summary.level} Agent Ready! Score: ${result.executive_summary.score}% \n\nScanned with Agent Ready`
                )}&url=${encodeURIComponent('https://agent-ready.org')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#1DA1F2] hover:bg-[#1a8cd8] rounded text-sm font-medium transition-colors"
              >
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://agent-ready.org')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#0A66C2] hover:bg-[#094d92] rounded text-sm font-medium transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="text-center py-8 text-text-muted">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">
              {type === 'og'
                ? 'Click the button above to generate a share image'
                : 'Click the button above to generate a certificate'}
            </p>
            <p className="text-xs mt-2 text-text-muted/70">Powered by Nano Banana Pro AI</p>
          </div>
        )
      )}
    </div>
  );
}
