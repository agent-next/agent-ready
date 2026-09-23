import { useState, type FormEvent } from 'react';

interface ScanFormProps {
  onSubmit: (repoUrl: string, branch?: string) => void;
  isLoading: boolean;
}

const texts = {
  title: 'Scan Your Repository',
  subtitle: 'Enter a GitHub repository URL to get an Agent Readiness Report',
  placeholder: 'https://github.com/owner/repo',
  branchPlaceholder: 'Branch (optional)',
  button: 'Start Scan',
  scanning: 'Scanning...',
  example: 'Example: https://github.com/anthropics/claude-code',
  hosts: 'Supports GitHub, GitLab, Bitbucket & self-hosted instances',
};

export function ScanForm({ onSubmit, isLoading }: ScanFormProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);

      // Only allow HTTPS (and HTTP for localhost during development)
      const isSecureProtocol =
        parsed.protocol === 'https:' ||
        (parsed.protocol === 'http:' && parsed.hostname === 'localhost');
      if (!isSecureProtocol) {
        return false;
      }

      // Allow well-known public git hosting platforms
      const publicHosts = ['github.com', 'gitlab.com', 'bitbucket.org'];
      if (publicHosts.includes(parsed.hostname)) {
        return true;
      }

      // Allow official enterprise/cloud subdomains
      // e.g., github.ibm.com (GitHub Enterprise), gitlab.example.com (GitLab self-hosted)
      if (parsed.hostname.endsWith('.github.com') || parsed.hostname.endsWith('.gitlab.com')) {
        return true;
      }

      // For self-hosted instances, require at least 4 domain parts
      // (e.g., gitlab.company.example.com, git.corp.example.org)
      // This prevents accepting short domains like git.evil.com
      const hostParts = parsed.hostname.split('.');
      if (hostParts.length >= 4) {
        const prefix = hostParts[0].toLowerCase();
        const validPrefixes = ['git', 'gitlab', 'github', 'gitea', 'bitbucket', 'gogs', 'forgejo'];
        if (validPrefixes.includes(prefix)) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!repoUrl.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    if (!validateUrl(repoUrl)) {
      setError(
        'Please enter a valid Git repository URL (GitHub, GitLab, Bitbucket or self-hosted)'
      );
      return;
    }

    onSubmit(repoUrl.trim(), branch.trim() || undefined);
  };

  return (
    <section className="container mx-auto px-6 py-12">
      <div className="max-w-2xl mx-auto animate-fade-in-up">
        <h2 className="font-display text-2xl font-bold text-center mb-2 text-text-primary">
          {texts.title}
        </h2>
        <p className="text-text-secondary text-center mb-8">{texts.subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="url"
              id="repo-url"
              aria-label="Repository URL"
              aria-describedby={error ? 'url-error' : undefined}
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder={texts.placeholder}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-bg-secondary border border-border-light rounded-lg
                         focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20
                         text-text-primary placeholder-text-muted
                         disabled:opacity-50 transition-all duration-200"
            />
            <input
              type="text"
              id="branch"
              aria-label="Branch name"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder={texts.branchPlaceholder}
              disabled={isLoading}
              className="w-full sm:w-40 px-4 py-3 bg-bg-secondary border border-border-light rounded-lg
                         focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20
                         text-text-primary placeholder-text-muted
                         disabled:opacity-50 transition-all duration-200"
            />
          </div>

          {error && (
            <p id="url-error" role="alert" className="text-level-1 text-sm text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-8 py-4 bg-accent-primary hover:bg-accent-secondary
                       disabled:bg-accent-primary/50 disabled:cursor-not-allowed
                       text-white rounded-lg font-semibold
                       transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5
                       flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {texts.scanning}
              </>
            ) : (
              texts.button
            )}
          </button>
        </form>

        <p className="text-text-muted text-sm text-center mt-4">
          {texts.example}
          <br />
          <span className="text-text-muted/70">{texts.hosts}</span>
        </p>
      </div>
    </section>
  );
}
