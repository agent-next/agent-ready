/**
 * RepoCard Component
 *
 * Compact card displaying repository agent readiness info.
 * Clicking opens the full scan report.
 */

import type { CommunityRepo } from '../data/community-reports';
import { LANGUAGE_COLORS } from '../data/community-reports';

interface RepoCardProps {
  repo: CommunityRepo;
  index?: number;
  onSelect: (repo: CommunityRepo) => void;
}

// Level color classes matching the existing color system
const LEVEL_STYLES: Record<number, { bg: string; text: string; border: string; dot: string }> = {
  1: { bg: 'bg-level-1/15', text: 'text-level-1', border: 'border-level-1/30', dot: 'bg-level-1' },
  2: { bg: 'bg-level-2/15', text: 'text-level-2', border: 'border-level-2/30', dot: 'bg-level-2' },
  3: { bg: 'bg-level-3/15', text: 'text-level-3', border: 'border-level-3/30', dot: 'bg-level-3' },
  4: { bg: 'bg-level-4/15', text: 'text-level-4', border: 'border-level-4/30', dot: 'bg-level-4' },
  5: { bg: 'bg-level-5/15', text: 'text-level-5', border: 'border-level-5/30', dot: 'bg-level-5' },
};

function formatStars(stars?: number): string {
  if (!stars) return '';
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1)}k`;
  }
  return stars.toString();
}

export function RepoCard({ repo, index = 0, onSelect }: RepoCardProps) {
  const levelStyle = LEVEL_STYLES[repo.level] || LEVEL_STYLES[1];
  const langColor = LANGUAGE_COLORS[repo.language] || { bg: 'bg-gray-100', text: 'text-gray-600' };

  return (
    <button
      onClick={() => onSelect(repo)}
      aria-label={`View scan report for ${repo.name}`}
      className="group block w-full text-left p-5 bg-bg-secondary border border-border-light rounded-xl
                 card-interactive animate-fade-in-up cursor-pointer"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header: Repo name + Language badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary truncate group-hover:text-accent-primary transition-colors">
            {repo.name}
          </h3>
          <p className="text-xs text-text-muted truncate">{repo.fullName}</p>
        </div>
        <span
          className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${langColor.bg} ${langColor.text}`}
        >
          {repo.language}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary mb-4 line-clamp-2 min-h-[2.5rem]">
        {repo.description}
      </p>

      {/* Footer: Level + Score + Stars */}
      <div className="flex items-center justify-between">
        {/* Level badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                       ${levelStyle.bg} ${levelStyle.text} border ${levelStyle.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${levelStyle.dot}`} />L{repo.level}
          </span>
          {/* Score */}
          <span className="text-sm font-medium text-text-secondary">{repo.score}%</span>
        </div>

        {/* GitHub stars */}
        {repo.stars && (
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <svg aria-hidden="true" className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>{formatStars(repo.stars)}</span>
          </div>
        )}
      </div>

      {/* Hover indicator */}
      <div className="mt-3 pt-3 border-t border-border-light/50 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-accent-primary flex items-center gap-1">
          View Scan Report
          <svg
            aria-hidden="true"
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      </div>
    </button>
  );
}
