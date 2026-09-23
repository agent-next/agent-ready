/**
 * LevelBadge Component Tests
 *
 * Tests badge rendering, sizes, labels, colors, and fallback behavior
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { LevelBadge } from './LevelBadge';

// Mock the getBadgeUrl function
vi.mock('../api/images', () => ({
  getBadgeUrl: vi.fn((level: number, size: string) => `/api/images/badge/${level}?size=${size}`),
}));

describe('LevelBadge', () => {
  describe('Rendering', () => {
    it('renders correct level text in fallback SVG', async () => {
      render(<LevelBadge level={3} />);

      // Trigger image error to show SVG fallback
      const img = screen.getByAltText(/level 3 badge/i);
      act(() => {
        img.dispatchEvent(new Event('error'));
      });

      // Wait for SVG to appear
      await waitFor(() => {
        const svg = screen.getByRole('img', { name: /level 3 badge/i });
        expect(svg).toBeInTheDocument();
      });

      // Check for level text in SVG
      const svgText = screen.getByRole('img').querySelector('text');
      expect(svgText).toHaveTextContent('L3');
    });

    it('renders image with correct src URL', () => {
      render(<LevelBadge level={2} size="md" />);

      const img = screen.getByAltText(/level 2 badge/i);
      expect(img).toHaveAttribute('src', '/api/images/badge/2?size=md');
    });

    it('renders with default medium size when size not specified', () => {
      render(<LevelBadge level={1} />);

      const img = screen.getByAltText(/level 1 badge/i);
      expect(img).toHaveAttribute('src', '/api/images/badge/1?size=md');
    });
  });

  describe('Sizes', () => {
    it('applies correct size for sm (32px)', () => {
      render(<LevelBadge level={1} size="sm" />);

      const container = screen.getByAltText(/level 1 badge/i).parentElement;
      expect(container).toHaveStyle({ width: '32px', height: '32px' });
    });

    it('applies correct size for md (64px)', () => {
      render(<LevelBadge level={1} size="md" />);

      const container = screen.getByAltText(/level 1 badge/i).parentElement;
      expect(container).toHaveStyle({ width: '64px', height: '64px' });
    });

    it('applies correct size for lg (128px)', () => {
      render(<LevelBadge level={1} size="lg" />);

      const container = screen.getByAltText(/level 1 badge/i).parentElement;
      expect(container).toHaveStyle({ width: '128px', height: '128px' });
    });

    it('uses correct image size parameter for sm', () => {
      render(<LevelBadge level={1} size="sm" />);

      const img = screen.getByAltText(/level 1 badge/i);
      expect(img).toHaveAttribute('src', '/api/images/badge/1?size=sm');
    });

    it('uses correct image size parameter for lg', () => {
      render(<LevelBadge level={1} size="lg" />);

      const img = screen.getByAltText(/level 1 badge/i);
      expect(img).toHaveAttribute('src', '/api/images/badge/1?size=lg');
    });
  });

  describe('Labels', () => {
    it('shows label when showLabel=true', () => {
      render(<LevelBadge level={1} showLabel={true} />);

      expect(screen.getByText('Functional')).toBeInTheDocument();
    });

    it('hides label when showLabel=false', () => {
      render(<LevelBadge level={1} showLabel={false} />);

      expect(screen.queryByText('Functional')).not.toBeInTheDocument();
    });

    it('hides label by default when showLabel not specified', () => {
      render(<LevelBadge level={1} />);

      expect(screen.queryByText('Functional')).not.toBeInTheDocument();
    });

    it('shows correct label for level 1', () => {
      render(<LevelBadge level={1} showLabel={true} />);

      expect(screen.getByText('Functional')).toBeInTheDocument();
    });

    it('shows correct label for level 2', () => {
      render(<LevelBadge level={2} showLabel={true} />);

      expect(screen.getByText('Documented')).toBeInTheDocument();
    });

    it('shows correct label for level 3', () => {
      render(<LevelBadge level={3} showLabel={true} />);

      expect(screen.getByText('Standardized')).toBeInTheDocument();
    });

    it('shows correct label for level 4', () => {
      render(<LevelBadge level={4} showLabel={true} />);

      expect(screen.getByText('Optimized')).toBeInTheDocument();
    });

    it('shows correct label for level 5', () => {
      render(<LevelBadge level={5} showLabel={true} />);

      expect(screen.getByText('Autonomous')).toBeInTheDocument();
    });

    it('applies correct text size for sm', () => {
      render(<LevelBadge level={1} size="sm" showLabel={true} />);

      const label = screen.getByText('Functional');
      expect(label).toHaveClass('text-xs');
    });

    it('applies correct text size for md', () => {
      render(<LevelBadge level={1} size="md" showLabel={true} />);

      const label = screen.getByText('Functional');
      expect(label).toHaveClass('text-sm');
    });

    it('applies correct text size for lg', () => {
      render(<LevelBadge level={1} size="lg" showLabel={true} />);

      const label = screen.getByText('Functional');
      expect(label).toHaveClass('text-base');
    });
  });

  describe('Colors', () => {
    it('shows red color for level 1 in fallback SVG', async () => {
      render(<LevelBadge level={1} />);

      const img = screen.getByAltText(/level 1 badge/i);
      act(() => {
        img.dispatchEvent(new Event('error'));
      });

      await waitFor(() => {
        const svg = screen.getByRole('img', { name: /level 1 badge: functional/i });
        expect(svg).toBeInTheDocument();
      });

      const circle = screen.getByRole('img').querySelector('circle[stroke]');
      expect(circle).toHaveAttribute('stroke', '#ef4444');
    });

    it('shows orange color for level 2 in fallback SVG', async () => {
      render(<LevelBadge level={2} />);

      const img = screen.getByAltText(/level 2 badge/i);
      act(() => {
        img.dispatchEvent(new Event('error'));
      });

      await waitFor(() => {
        const svg = screen.getByRole('img', { name: /level 2 badge: documented/i });
        expect(svg).toBeInTheDocument();
      });

      const circle = screen.getByRole('img').querySelector('circle[stroke]');
      expect(circle).toHaveAttribute('stroke', '#f97316');
    });

    it('shows yellow color for level 3 in fallback SVG', async () => {
      render(<LevelBadge level={3} />);

      const img = screen.getByAltText(/level 3 badge/i);
      img.dispatchEvent(new Event('error'));

      await waitFor(() => {
        const svg = screen.getByRole('img', { name: /level 3 badge: standardized/i });
        expect(svg).toBeInTheDocument();
      });

      const circle = screen.getByRole('img').querySelector('circle[stroke]');
      expect(circle).toHaveAttribute('stroke', '#eab308');
    });

    it('shows green color for level 4 in fallback SVG', async () => {
      render(<LevelBadge level={4} />);

      const img = screen.getByAltText(/level 4 badge/i);
      act(() => {
        img.dispatchEvent(new Event('error'));
      });

      await waitFor(() => {
        const svg = screen.getByRole('img', { name: /level 4 badge: optimized/i });
        expect(svg).toBeInTheDocument();
      });

      const circle = screen.getByRole('img').querySelector('circle[stroke]');
      expect(circle).toHaveAttribute('stroke', '#22c55e');
    });

    it('shows blue color for level 5 in fallback SVG', async () => {
      render(<LevelBadge level={5} />);

      const img = screen.getByAltText(/level 5 badge/i);
      act(() => {
        img.dispatchEvent(new Event('error'));
      });

      await waitFor(() => {
        const svg = screen.getByRole('img', { name: /level 5 badge: autonomous/i });
        expect(svg).toBeInTheDocument();
      });

      const circle = screen.getByRole('img').querySelector('circle[stroke]');
      expect(circle).toHaveAttribute('stroke', '#3b82f6');
    });

    it('applies correct color to label for level 1', () => {
      render(<LevelBadge level={1} showLabel={true} />);

      const label = screen.getByText('Functional');
      expect(label).toHaveStyle({ color: '#ef4444' });
    });

    it('applies correct color to label for level 5', () => {
      render(<LevelBadge level={5} showLabel={true} />);

      const label = screen.getByText('Autonomous');
      expect(label).toHaveStyle({ color: '#3b82f6' });
    });
  });

  describe('Image Fallback', () => {
    it('shows image initially before error', () => {
      render(<LevelBadge level={1} />);

      const img = screen.getByAltText(/level 1 badge/i);
      expect(img).toBeInTheDocument();
      expect(img.tagName).toBe('IMG');
    });

    it('shows fallback SVG when image fails to load', async () => {
      render(<LevelBadge level={1} />);

      const img = screen.getByAltText(/level 1 badge/i);
      act(() => {
        img.dispatchEvent(new Event('error'));
      });

      await waitFor(() => {
        const svg = screen.getByRole('img', { name: /level 1 badge: functional/i });
        expect(svg).toBeInTheDocument();
        expect(svg.tagName).toBe('svg');
      });
    });

    it('fallback SVG has correct number of stars for level 3', async () => {
      render(<LevelBadge level={3} />);

      const img = screen.getByAltText(/level 3 badge/i);
      img.dispatchEvent(new Event('error'));

      await waitFor(() => {
        const svg = screen.getByRole('img', { name: /level 3 badge: standardized/i });
        expect(svg).toBeInTheDocument();
      });

      const stars = screen.getByRole('img').querySelectorAll('circle[r="4"]');
      expect(stars).toHaveLength(3);
    });

    it('fallback SVG has correct number of stars for level 5', async () => {
      render(<LevelBadge level={5} />);

      const img = screen.getByAltText(/level 5 badge/i);
      act(() => {
        img.dispatchEvent(new Event('error'));
      });

      await waitFor(() => {
        const svg = screen.getByRole('img', { name: /level 5 badge: autonomous/i });
        expect(svg).toBeInTheDocument();
      });

      const stars = screen.getByRole('img').querySelectorAll('circle[r="4"]');
      expect(stars).toHaveLength(5);
    });

    it('does not show image when fallback SVG is displayed', async () => {
      render(<LevelBadge level={1} />);

      const img = screen.getByAltText(/level 1 badge/i);

      // Verify image is initially shown
      expect(img).toBeInTheDocument();

      // Trigger error to show fallback
      img.dispatchEvent(new Event('error'));

      await waitFor(() => {
        const svg = screen.getByRole('img', { name: /level 1 badge: functional/i });
        expect(svg).toBeInTheDocument();
      });

      // The original img element should still be in the DOM but not rendered (conditional rendering)
      // The implementation uses {!imageError && <img />} so the img is removed when error occurs
      const images = screen.queryAllByAltText(/level 1 badge/i);
      expect(images).toHaveLength(0);
    });
  });

  describe('Custom className', () => {
    it('applies custom className to wrapper', () => {
      const { container } = render(<LevelBadge level={1} className="custom-class" />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('preserves default classes when custom className provided', () => {
      const { container } = render(<LevelBadge level={1} className="custom-class" />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('inline-flex');
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('falls back to level 1 config for invalid level', async () => {
      render(<LevelBadge level={99} showLabel={true} />);

      // Should show level 1 label (Functional) as fallback
      expect(screen.getByText('Functional')).toBeInTheDocument();
    });

    it('handles level 0 by falling back to level 1', async () => {
      render(<LevelBadge level={0} showLabel={true} />);

      expect(screen.getByText('Functional')).toBeInTheDocument();
    });
  });
});
