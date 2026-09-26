import { useState } from 'react';
import './App.css';
import { ScanForm, ScanProgress, ResultsView, FeaturedRepos } from './components';
import { useScan } from './hooks/useScan';
import type { CommunityRepo } from './data/community-reports';

const pillars = [
  {
    name: 'Documentation',
    icon: '📖',
    desc: 'README, AGENTS.md, CHANGELOG',
  },
  {
    name: 'Code Style',
    icon: '✨',
    desc: 'Linting, formatting, TypeScript',
  },
  {
    name: 'Build System',
    icon: '🔧',
    desc: 'Scripts, CI/CD, lock files',
  },
  {
    name: 'Testing',
    icon: '🧪',
    desc: 'Unit tests, integration tests',
  },
  {
    name: 'Security',
    icon: '🔒',
    desc: 'Gitignore, Dependabot, secrets',
  },
  {
    name: 'Observability',
    icon: '📊',
    desc: 'Logging, tracing, metrics',
  },
  {
    name: 'Environment',
    icon: '🌍',
    desc: 'Devcontainer, Docker, .env',
  },
  {
    name: 'Task Discovery',
    icon: '📋',
    desc: 'Issue & PR templates',
  },
  {
    name: 'Product',
    icon: '🚀',
    desc: 'Feature flags, analytics',
  },
];

const levels = [
  { level: 'L1', name: 'Functional', color: 'bg-level-1' },
  { level: 'L2', name: 'Documented', color: 'bg-level-2' },
  { level: 'L3', name: 'Standardized', color: 'bg-level-3' },
  { level: 'L4', name: 'Optimized', color: 'bg-level-4' },
  { level: 'L5', name: 'Autonomous', color: 'bg-level-5' },
];

// Section divider component with dot pattern
function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-border-medium" />
      <div className="flex gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-primary/40" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent-primary/60" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent-primary/60" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent-primary/40" />
      </div>
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-border-medium" />
    </div>
  );
}

const texts = {
  badge: 'Factory.ai Compatible',
  title: 'Agent Ready',
  subtitle:
    "Evaluate your repository's readiness for AI agents with the 9 Pillars / 5 Levels maturity model.",
  getStarted: 'Get Started',
  learnMore: 'Learn More',
  install: 'Install globally',
  copy: 'Copy',
  levelsTitle: '5 Maturity Levels',
  pillarsTitle: '9 Pillars',
  pillarsDesc:
    'Each pillar represents a dimension of repository maturity that AI agents need to work effectively.',
  quickStart: 'Quick Start',
  step1: '1. Scan your repository',
  step2: '2. Review the report',
  step3: '3. Fix issues with init',
  cta: 'Ready to make your repo agent-ready?',
  github: 'View on GitHub',
  footer: 'Built for AI agents. Made with Claude Code.',
  onlineScan: 'Online Scan',
};

function App() {
  const [showScan, setShowScan] = useState(false);
  const [copied, setCopied] = useState<'idle' | 'copied' | 'error'>('idle');
  const [selectedCommunityRepo, setSelectedCommunityRepo] = useState<CommunityRepo | null>(null);
  const { status, result, error, isLoading, isPolling, startScan, reset } = useScan();

  const handleScanSubmit = (repoUrl: string, branch?: string) => {
    startScan(repoUrl, branch);
  };

  const handleReset = () => {
    reset();
    setSelectedCommunityRepo(null);
    setShowScan(true);
  };

  const handleCommunityRepoReset = () => {
    setSelectedCommunityRepo(null);
  };

  // Show community repo results if selected
  if (selectedCommunityRepo) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary font-body">
        <ResultsView result={selectedCommunityRepo.scanResult} onReset={handleCommunityRepoReset} />
      </div>
    );
  }

  // Show results view if scan completed
  if (result) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary font-body">
        <ResultsView result={result} onReset={handleReset} />
      </div>
    );
  }

  // Show progress view if scanning
  if (status && (isPolling || isLoading) && !error) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary font-body">
        <ScanProgress status={status.status} repoUrl={status.repo_url} />
      </div>
    );
  }

  // Show scan form or landing page
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-body">
      {/* Hero with warm scientific aesthetic */}
      <header className="relative container mx-auto px-6 py-20 text-center overflow-hidden">
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--color-accent-primary) 1px, transparent 1px),
              linear-gradient(to bottom, var(--color-accent-primary) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-bg-primary via-transparent to-bg-primary" />

        {/* Large decorative "9" watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none select-none">
          <span className="text-[20rem] font-display font-bold text-accent-primary/[0.03]">9</span>
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-12 h-12 rounded-full bg-accent-primary/10 animate-float -z-10" />
        <div className="absolute top-40 right-20 w-8 h-8 rounded-lg bg-level-4/10 rotate-45 animate-float-delayed -z-10" />
        <div
          className="absolute bottom-32 left-1/4 w-6 h-6 rounded-full bg-level-5/10 animate-float -z-10"
          style={{ animationDelay: '1s' }}
        />
        <div className="absolute bottom-20 right-1/3 w-10 h-10 rounded-lg bg-accent-primary/10 rotate-12 animate-float-delayed -z-10" />

        {/* Title */}
        <h1
          className="font-display text-5xl md:text-7xl font-bold mb-6 text-text-primary animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          {texts.title}
        </h1>

        {/* Subtitle */}
        <p
          className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto mb-10 animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          {texts.subtitle}
        </p>

        {/* Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <button
            onClick={() => setShowScan(true)}
            className="btn-glow px-8 py-4 bg-accent-primary hover:bg-accent-secondary text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            {texts.onlineScan}
          </button>
          <a
            href="#pillars"
            className="px-8 py-4 bg-bg-secondary hover:bg-bg-tertiary border border-border-light rounded-lg font-semibold transition-all duration-300"
          >
            {texts.learnMore}
          </a>
        </div>

        {/* Demo Video */}
        <div
          className="mt-16 max-w-4xl mx-auto animate-fade-in-up"
          style={{ animationDelay: '400ms' }}
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border-light bg-bg-secondary">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full"
              poster="/generated/hero-bg.jpeg"
            >
              <source src="/agent-ready-demo.mp4" type="video/mp4" />
            </video>
          </div>
          <p className="text-center mt-4 text-text-muted text-sm">
            See agent-ready in action: scan your repo and get an instant readiness report
          </p>
        </div>
      </header>

      <main>
        {/* Scan Form (shown when showScan is true) */}
        {showScan && <ScanForm onSubmit={handleScanSubmit} isLoading={isLoading} />}

        {/* Error display */}
        {error && (
          <div className="container mx-auto px-6 py-4">
            <div className="max-w-2xl mx-auto bg-level-1/10 border border-level-1/30 rounded-lg p-4 text-center">
              <p className="text-level-1">{error}</p>
              <button
                onClick={reset}
                className="mt-2 text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Install */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto bg-bg-code rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            {/* Terminal window chrome */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#1e1b18] border-b border-[#3d3830]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="text-xs text-[#8c8377] font-mono">terminal</span>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText('npm install -g agent-ready');
                    setCopied('copied');
                    setTimeout(() => setCopied('idle'), 2000);
                  } catch {
                    setCopied('error');
                    setTimeout(() => setCopied('idle'), 2000);
                  }
                }}
                className="text-sm text-accent-primary hover:text-accent-secondary transition-colors"
              >
                {copied === 'copied' && (
                  <span className="animate-pop-in text-level-4">✓ Copied!</span>
                )}
                {copied === 'error' && (
                  <span className="animate-pop-in text-level-1">✗ Failed</span>
                )}
                {copied === 'idle' && texts.copy}
              </button>
            </div>
            {/* Terminal content */}
            <div className="p-6">
              <code className="block text-lg text-green-400 font-mono">
                $ npm install -g agent-ready
              </code>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Levels */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="font-display text-3xl font-bold text-center mb-12">{texts.levelsTitle}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {levels.map(({ level, name, color }, index) => (
              <div
                key={level}
                className="flex items-center gap-3 px-6 py-3 bg-bg-secondary border border-border-light rounded-lg animate-fade-in-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <span className={`w-3 h-3 rounded-full ${color}`}></span>
                <span className="font-semibold">{level}</span>
                <span className="text-text-secondary">{name}</span>
              </div>
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* Pillars */}
        <section id="pillars" className="container mx-auto px-6 py-20">
          <h2 className="font-display text-3xl font-bold text-center mb-4">{texts.pillarsTitle}</h2>
          <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
            {texts.pillarsDesc}
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pillars.map(({ name, icon, desc }, index) => (
              <div
                key={name}
                className="group p-6 bg-bg-secondary border border-border-light rounded-xl
                         transition-all duration-300
                         hover:border-accent-primary/40 hover:shadow-lg hover:-translate-y-1
                         animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  {icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{name}</h3>
                <p className="text-text-secondary text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* Featured Repositories */}
        <FeaturedRepos onSelectRepo={setSelectedCommunityRepo} />

        <SectionDivider />

        {/* Usage */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="font-display text-3xl font-bold text-center mb-12">{texts.quickStart}</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-bg-secondary border border-border-light rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">{texts.step1}</h3>
              <code className="block text-green-600 font-mono bg-bg-code text-green-400 px-4 py-2 rounded-lg">
                $ agent-ready scan .
              </code>
            </div>
            <div className="bg-bg-secondary border border-border-light rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">{texts.step2}</h3>
              <pre className="text-sm text-text-secondary font-mono overflow-x-auto bg-bg-code text-slate-300 px-4 py-3 rounded-lg">
                {`┌─────────────────────────────────────────────────┐
│          Level: L3                              │
│          Score: 84%                             │
└─────────────────────────────────────────────────┘`}
              </pre>
            </div>
            <div className="bg-bg-secondary border border-border-light rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">{texts.step3}</h3>
              <code className="block text-green-600 font-mono bg-bg-code text-green-400 px-4 py-2 rounded-lg">
                $ agent-ready init --level L3
              </code>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative container mx-auto px-6 py-20 text-center overflow-hidden">
          {/* Subtle accent background */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent-muted/30 via-transparent to-accent-muted/20 rounded-3xl mx-6" />
          <h2 className="font-display text-3xl font-bold mb-6">{texts.cta}</h2>
          <a
            href="https://github.com/robotlearning123/agent-ready"
            className="btn-glow inline-flex items-center gap-2 px-8 py-4 bg-accent-primary hover:bg-accent-secondary text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            {texts.github}
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border-light pt-12 pb-8 overflow-hidden">
        {/* Wave pattern background */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <svg
            className="absolute bottom-0 w-full h-32 text-accent-muted"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8c106.28-26.69,199.11-16.89,321.39-39.36Z"
            />
          </svg>
        </div>

        <div className="container mx-auto px-6">
          {/* 2-column layout */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="font-display text-lg font-semibold text-text-primary mb-2">
                Agent Ready
              </h3>
              <p className="text-text-muted text-sm">
                Evaluate your repository's readiness for AI agents with the 9 Pillars / 5 Levels
                maturity model.
              </p>
            </div>

            {/* Links */}
            <div className="text-center">
              <h4 className="font-semibold text-text-secondary mb-2">Resources</h4>
              <div className="flex flex-col gap-1">
                <a
                  href="https://github.com/robotlearning123/agent-ready"
                  className="text-text-muted hover:text-accent-primary transition-colors text-sm"
                >
                  GitHub Repository
                </a>
                <a
                  href="https://github.com/robotlearning123/agent-ready#readme"
                  className="text-text-muted hover:text-accent-primary transition-colors text-sm"
                >
                  Documentation
                </a>
                <a
                  href="https://www.npmjs.com/package/agent-ready"
                  className="text-text-muted hover:text-accent-primary transition-colors text-sm"
                >
                  NPM Package
                </a>
              </div>
            </div>
          </div>

          {/* Decorative dot flourish */}
          <div className="flex justify-center gap-2 mb-4">
            <span className="w-1 h-1 rounded-full bg-accent-primary/30" />
            <span className="w-1 h-1 rounded-full bg-accent-primary/50" />
            <span className="w-1 h-1 rounded-full bg-accent-primary/70" />
            <span className="w-1 h-1 rounded-full bg-accent-primary/50" />
            <span className="w-1 h-1 rounded-full bg-accent-primary/30" />
          </div>

          {/* Copyright */}
          <div className="text-center text-text-muted text-xs">
            <p>© 2026 Agent Ready.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
