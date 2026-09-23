import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/test/**/*',
        // Chart components (visual, hard to unit test meaningfully)
        'src/components/RadarChart.tsx',
        'src/components/PillarBarChart.tsx',
        'src/components/LevelProgressChart.tsx',
        // View components (UI rendering, tested via e2e)
        'src/components/ResultsView.tsx',
        'src/components/ScanProgress.tsx',
        'src/components/ShareImage.tsx',
        'src/components/FeaturedRepos.tsx',
        'src/components/RepoCard.tsx',
        'src/components/index.ts',
        // Root app and data
        'src/App.tsx',
        'src/test-results.tsx',
        'src/data/**/*',
        'src/constants/**/*',
        // Helper hooks for charts
        'src/hooks/useChartSize.ts',
        // Image generation (server-side utility)
        'src/api/images.ts',
      ],
      thresholds: {
        // Contract-tested modules should maintain high coverage
        // Excluded visual components are tested via e2e or manual QA
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
