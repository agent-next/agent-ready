import { useState, useEffect, useCallback, useRef } from 'react';

interface ChartSize {
  width: number;
  height: number;
}

interface UseChartSizeOptions {
  defaultWidth?: number;
  defaultHeight?: number;
  aspectRatio?: number;
  minWidth?: number;
  maxWidth?: number;
  debounceMs?: number;
}

/**
 * Custom hook for responsive chart sizing
 * Automatically adjusts chart dimensions based on container width
 */
export function useChartSize(
  containerRef: React.RefObject<HTMLElement>,
  options: UseChartSizeOptions = {}
): ChartSize {
  const {
    defaultWidth = 600,
    defaultHeight = 400,
    aspectRatio,
    minWidth = 300,
    maxWidth = 800,
    debounceMs = 150,
  } = options;

  const [size, setSize] = useState<ChartSize>({
    width: defaultWidth,
    height: defaultHeight,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calculateSize = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const newWidth = Math.min(Math.max(containerWidth - 48, minWidth), maxWidth);
    const newHeight = aspectRatio ? newWidth / aspectRatio : defaultHeight;

    setSize({ width: newWidth, height: newHeight });
  }, [containerRef, minWidth, maxWidth, aspectRatio, defaultHeight]);

  useEffect(() => {
    // Initial calculation
    calculateSize();

    // Debounced resize handler
    const handleResize = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(calculateSize, debounceMs);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [calculateSize, debounceMs]);

  return size;
}

/**
 * Simplified hook that only tracks container width
 */
export function useContainerWidth(
  containerRef: React.RefObject<HTMLElement>,
  defaultWidth = 600
): number {
  const [width, setWidth] = useState(defaultWidth);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      setWidth(container.clientWidth - 48);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return width;
}
