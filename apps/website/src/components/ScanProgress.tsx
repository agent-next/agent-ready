interface ScanProgressProps {
  status: 'queued' | 'cloning' | 'scanning' | 'completed' | 'failed';
  repoUrl: string;
}

const statusTexts: Record<string, string> = {
  queued: 'Queued...',
  cloning: 'Cloning repository...',
  scanning: '9 Agents analyzing in parallel...',
  completed: 'Scan complete',
  failed: 'Scan failed',
};

const statusProgress: Record<string, number> = {
  queued: 10,
  cloning: 30,
  scanning: 60,
  completed: 100,
  failed: 100,
};

export function ScanProgress({ status, repoUrl }: ScanProgressProps) {
  const statusText = statusTexts[status];
  const progress = statusProgress[status];
  const isFailed = status === 'failed';

  // Extract repo name from URL
  const repoName = repoUrl.split('/').slice(-2).join('/');

  return (
    <section className="container mx-auto px-6 py-12">
      <div className="max-w-2xl mx-auto bg-bg-secondary border border-border-light rounded-xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isFailed ? 'bg-level-1/20' : 'bg-accent-muted'
            }`}
          >
            {status === 'completed' ? (
              <svg
                className="w-6 h-6 text-level-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : isFailed ? (
              <svg
                className="w-6 h-6 text-level-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-accent-primary animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
          </div>
          <div aria-live="polite" aria-atomic="true">
            <h3 className="font-semibold text-lg text-text-primary">{statusText}</h3>
            <p className="text-text-muted text-sm font-mono">{repoName}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="w-full bg-border-light rounded-full h-2 overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Scan progress"
        >
          <div
            className={`h-full transition-all duration-500 ${
              isFailed ? 'bg-level-1' : 'bg-accent-primary'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Orbital agent visualization */}
        {status === 'scanning' && (
          <div className="mt-8 flex justify-center">
            <div className="relative w-64 h-64">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-accent-primary/30 animate-spin-slow" />

              {/* Inner rotating ring (opposite direction) */}
              <div className="absolute inset-6 rounded-full border border-accent-primary/20 animate-orbit-reverse" />

              {/* Center hub */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-accent-muted flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent-primary">9</span>
                </div>
              </div>

              {/* Orbiting agent icons */}
              {['📖', '✨', '🔧', '🧪', '🔒', '📊', '🌍', '📋', '🚀'].map((icon, i) => {
                const angle = i * 40 - 90; // Start from top, 40 degrees apart
                const radius = 100; // Distance from center
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                return (
                  <div
                    key={i}
                    className="absolute w-10 h-10 rounded-full bg-bg-secondary border border-border-light shadow-md flex items-center justify-center animate-orbit"
                    style={{
                      left: `calc(50% + ${x}px - 20px)`,
                      top: `calc(50% + ${y}px - 20px)`,
                      animationDelay: `${i * 150}ms`,
                    }}
                  >
                    <span className="text-lg">{icon}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
