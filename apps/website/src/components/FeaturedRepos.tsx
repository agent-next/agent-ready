/**
 * FeaturedRepos Section Component
 *
 * Displays a grid of pre-scanned popular open-source repositories.
 * Clicking a card opens the full scan report.
 */

import type { CommunityRepo } from '../data/community-reports';
import { FEATURED_REPOS } from '../data/community-reports';
import { RepoCard } from './RepoCard';

interface FeaturedReposProps {
  onSelectRepo: (repo: CommunityRepo) => void;
}

export function FeaturedRepos({ onSelectRepo }: FeaturedReposProps) {
  return (
    <section className="container mx-auto px-6 py-20" aria-labelledby="featured-repos-heading">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 id="featured-repos-heading" className="font-display text-3xl font-bold mb-4">
          Featured Repositories
        </h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Popular open-source projects evaluated for AI agent readiness. Click any card to view the
          full scan report.
        </p>
      </div>

      {/* Repository Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
        {FEATURED_REPOS.map((repo, index) => (
          <RepoCard key={repo.id} repo={repo} index={index} onSelect={onSelectRepo} />
        ))}
      </div>
    </section>
  );
}
