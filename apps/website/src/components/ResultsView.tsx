import {
  useState,
  useMemo,
  lazy,
  Suspense,
  Component,
  type ReactNode,
  type ErrorInfo,
} from 'react';
import {
  API_BASE,
  type ScanResult,
  type PillarResult,
  type ActionItem,
  type ImprovementRoadmap,
} from '../api/scan';

// Lazy load chart components for better initial bundle size
const RadarChart = lazy(() => import('./RadarChart').then((m) => ({ default: m.RadarChart })));
const LevelProgressChart = lazy(() =>
  import('./LevelProgressChart').then((m) => ({ default: m.LevelProgressChart }))
);
const PillarBarChart = lazy(() =>
  import('./PillarBarChart').then((m) => ({ default: m.PillarBarChart }))
);

import {
  LEVEL_BG_CLASSES,
  LEVEL_TEXT_CLASSES,
  LEVEL_NAMES,
  INSIGHT_ICONS,
  INSIGHT_COLORS,
  getTechDebtColor,
  getImpactColor,
  getEffortColor,
} from '../constants/colors';

/** Loading fallback for lazy-loaded charts */
function ChartLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
    </div>
  );
}

interface ChartErrorBoundaryState {
  hasError: boolean;
}

class ChartErrorBoundary extends Component<{ children: ReactNode }, ChartErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Chart failed to load:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-64 text-text-muted">
          <p>Failed to load chart. Please refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface ResultsViewProps {
  result: ScanResult;
  onReset: () => void;
}

interface RoadmapSection {
  key: string;
  label: string;
  items: ActionItem[];
  icon: string;
}

function createRoadmapSections(roadmap: ImprovementRoadmap): RoadmapSection[] {
  return [
    { key: 'quick_wins', label: 'Quick Wins', items: roadmap.quick_wins, icon: '⚡' },
    { key: 'short_term', label: 'Short Term', items: roadmap.short_term, icon: '📅' },
    { key: 'medium_term', label: 'Medium Term', items: roadmap.medium_term, icon: '📆' },
    { key: 'long_term', label: 'Long Term', items: roadmap.long_term, icon: '🎯' },
  ];
}

export function ResultsView({ result, onReset }: ResultsViewProps) {
  const { executive_summary, detailed_analysis, improvement_roadmap, charts, meta } = result;
  const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>('quick_wins');
  const [chartView, setChartView] = useState<'radar' | 'bar'>('radar');

  // Memoize derived data to avoid recomputing on each render
  const radarLabels = useMemo(
    () => charts.pillar_radar.map((p) => p.pillar),
    [charts.pillar_radar]
  );
  const radarValues = useMemo(() => charts.pillar_radar.map((p) => p.score), [charts.pillar_radar]);
  const roadmapSections = useMemo(
    () => createRoadmapSections(improvement_roadmap),
    [improvement_roadmap]
  );

  return (
    <section className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Summary Card */}
        <div
          className="card-primary relative rounded-2xl p-8 animate-fade-in-up overflow-hidden"
          style={{ animationDelay: '0ms' }}
        >
          {/* Decorative corner flourish */}
          <svg
            className="absolute top-0 right-0 w-32 h-32 text-accent-primary/10"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <circle cx="100" cy="0" r="80" />
            <circle cx="100" cy="0" r="60" className="text-accent-primary/5" />
            <circle cx="100" cy="0" r="40" className="text-accent-primary/5" />
          </svg>
          <svg
            className="absolute bottom-0 left-0 w-24 h-24 text-accent-primary/5"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <circle cx="0" cy="100" r="60" />
          </svg>

          <div className="relative flex flex-col md:flex-row items-center gap-8">
            {/* Level badge with pulsing ring */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Pulsing ring */}
                <div
                  className={`absolute inset-0 rounded-full ${LEVEL_BG_CLASSES[executive_summary.level || 0]} opacity-30`}
                  style={{ animation: 'pulse-ring 2s ease-out infinite' }}
                />
                <div
                  className={`relative w-24 h-24 rounded-full ${LEVEL_BG_CLASSES[executive_summary.level || 0]} flex items-center justify-center shadow-lg animate-pop-in`}
                  style={{ animationDelay: '200ms' }}
                >
                  <span className="text-3xl font-bold text-white">
                    {executive_summary.level ? `L${executive_summary.level}` : 'N/A'}
                  </span>
                </div>
              </div>
              <span className="mt-2 text-text-secondary">
                {executive_summary.level
                  ? `L${executive_summary.level} ${LEVEL_NAMES[executive_summary.level]}`
                  : 'Not Achieved'}
              </span>
            </div>

            {/* Headline and Score */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-display text-2xl font-bold mb-2 text-text-primary">
                {executive_summary.headline}
              </h2>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <p className="text-text-secondary">
                  Overall Score:{' '}
                  <span className="text-text-primary font-semibold">
                    {executive_summary.score}%
                  </span>
                </p>
                {detailed_analysis.tech_debt_score > 0 && (
                  <p className="text-text-secondary">
                    Tech Debt:{' '}
                    <span
                      className={`font-semibold ${getTechDebtColor(detailed_analysis.tech_debt_score)}`}
                    >
                      {detailed_analysis.tech_debt_score}%
                    </span>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {executive_summary.key_strengths.slice(0, 3).map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-level-4/20 text-level-4 rounded-full text-sm animate-fade-in-up"
                    style={{ animationDelay: `${300 + i * 100}ms` }}
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div
          className="bg-bg-secondary border border-border-light rounded-xl p-6 shadow-sm animate-fade-in-up"
          style={{ animationDelay: '50ms' }}
        >
          <h3 className="font-display text-xl font-semibold mb-4 text-text-primary">
            Level Progress
          </h3>
          <ChartErrorBoundary>
            <Suspense fallback={<ChartLoadingFallback />}>
              <LevelProgressChart data={charts.level_progress} />
            </Suspense>
          </ChartErrorBoundary>
        </div>

        {/* Pillar Analysis Chart */}
        <div
          className="bg-bg-secondary border border-border-light rounded-xl p-6 shadow-sm animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl font-semibold text-text-primary">
              9 Pillars Analysis
            </h3>
            <div className="flex bg-bg-tertiary rounded-lg p-1">
              <button
                onClick={() => setChartView('radar')}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  chartView === 'radar'
                    ? 'bg-accent-primary text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Radar
              </button>
              <button
                onClick={() => setChartView('bar')}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  chartView === 'bar'
                    ? 'bg-accent-primary text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Bar
              </button>
            </div>
          </div>
          <ChartErrorBoundary>
            <Suspense fallback={<ChartLoadingFallback />}>
              {chartView === 'radar' ? (
                <RadarChart labels={radarLabels} values={radarValues} />
              ) : (
                <PillarBarChart pillars={detailed_analysis.pillars} />
              )}
            </Suspense>
          </ChartErrorBoundary>
        </div>

        {/* Pillar Details */}
        <div
          className="bg-bg-secondary border border-border-light rounded-xl p-6 shadow-sm animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          <h3 className="font-display text-xl font-semibold mb-6 text-text-primary">
            Pillar Details
          </h3>
          <div className="grid gap-4">
            {detailed_analysis.pillars.map((pillar: PillarResult, index: number) => (
              <div
                key={pillar.pillar}
                className="flex items-center gap-4 p-4 bg-bg-tertiary rounded-lg animate-fade-in-up"
                style={{ animationDelay: `${250 + index * 50}ms` }}
              >
                <span className="text-2xl">{pillar.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-text-primary">{pillar.name}</span>
                    <span className={`text-sm ${LEVEL_TEXT_CLASSES[pillar.level_achieved || 0]}`}>
                      {pillar.level_achieved ? `L${pillar.level_achieved}` : 'N/A'} · {pillar.score}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-border-light rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${LEVEL_BG_CLASSES[pillar.level_achieved || 0]} transition-all duration-700 ease-out`}
                      style={{
                        width: `${pillar.score}%`,
                        animation: 'progress-fill 0.8s ease-out forwards',
                        animationDelay: `${300 + index * 50}ms`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Gaps */}
        {executive_summary.critical_gaps.length > 0 && (
          <div
            className="bg-level-1/10 border border-level-1/30 rounded-xl p-6 animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <h3 className="font-display text-xl font-semibold mb-4 text-level-1">Critical Gaps</h3>
            <ul className="space-y-2">
              {executive_summary.critical_gaps.map((gap, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-text-secondary animate-fade-in-up"
                  style={{ animationDelay: `${350 + i * 50}ms` }}
                >
                  <span className="text-level-1">✗</span>
                  {gap}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cross-Pillar Insights */}
        {detailed_analysis.cross_pillar_insights.length > 0 && (
          <div
            className="bg-bg-secondary border border-border-light rounded-xl p-6 shadow-sm animate-fade-in-up"
            style={{ animationDelay: '350ms' }}
          >
            <h3 className="font-display text-xl font-semibold mb-4 text-text-primary">
              Cross-Pillar Insights
            </h3>
            <div className="space-y-3">
              {detailed_analysis.cross_pillar_insights.map((insight, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border ${INSIGHT_COLORS[insight.type]} animate-fade-in-up`}
                  style={{ animationDelay: `${400 + i * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{INSIGHT_ICONS[insight.type]}</span>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {insight.pillars.map((p) => (
                          <span
                            key={p}
                            className="text-xs px-2 py-0.5 bg-bg-tertiary rounded-full text-text-muted"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                      <p className="text-text-primary font-medium">{insight.insight}</p>
                      <p className="text-text-secondary text-sm mt-1">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {executive_summary.next_steps.length > 0 && (
          <div
            className="bg-accent-primary/10 border border-accent-primary/30 rounded-xl p-6 animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <h3 className="font-display text-xl font-semibold mb-4 text-accent-primary">
              Recommended Next Steps
            </h3>
            <ol className="space-y-3">
              {executive_summary.next_steps.map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-text-secondary animate-fade-in-up"
                  style={{ animationDelay: `${450 + i * 50}ms` }}
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-primary text-white text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Improvement Roadmap */}
        <div
          className="bg-bg-secondary border border-border-light rounded-xl p-6 shadow-sm animate-fade-in-up"
          style={{ animationDelay: '450ms' }}
        >
          <h3 className="font-display text-xl font-semibold mb-4 text-text-primary">
            Improvement Roadmap
          </h3>
          <div className="space-y-2">
            {roadmapSections.map(
              (section) =>
                section.items.length > 0 && (
                  <div
                    key={section.key}
                    className="border border-border-light rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedRoadmap(expandedRoadmap === section.key ? null : section.key)
                      }
                      className="w-full flex items-center justify-between p-4 bg-bg-tertiary hover:bg-border-light transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>{section.icon}</span>
                        <span className="font-medium text-text-primary">{section.label}</span>
                        <span className="text-text-muted text-sm">
                          ({section.items.length} items)
                        </span>
                      </div>
                      <span
                        className={`transform transition-transform ${expandedRoadmap === section.key ? 'rotate-180' : ''}`}
                      >
                        ▼
                      </span>
                    </button>
                    {expandedRoadmap === section.key && (
                      <div className="p-4 space-y-2">
                        {section.items.map((item: ActionItem, i: number) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-3 bg-bg-primary rounded-lg animate-fade-in-up"
                            style={{ animationDelay: `${i * 30}ms` }}
                          >
                            <span className="text-level-4">→</span>
                            <div className="flex-1">
                              <p className="text-text-primary">{item.action}</p>
                              <div className="flex gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 bg-bg-tertiary rounded text-text-muted">
                                  {item.pillar}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded ${getImpactColor(item.impact)}`}
                                >
                                  {item.impact} impact
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded ${getEffortColor(item.effort)}`}
                                >
                                  {item.effort} effort
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
            )}
          </div>
        </div>

        {/* Meta info */}
        <div
          className="text-center text-text-muted text-sm animate-fade-in-up"
          style={{ animationDelay: '500ms' }}
        >
          <p>
            Scan duration: {meta.scan_duration_ms}ms · Used {meta.agents_used} agents
          </p>
          <p className="mt-1">
            Commit:{' '}
            <code className="font-mono bg-bg-tertiary px-2 py-0.5 rounded">
              {meta.commit.slice(0, 7)}
            </code>{' '}
            ·{new Date(meta.timestamp).toLocaleString()}
          </p>
        </div>

        {/* Actions */}
        <div
          className="flex justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: '600ms' }}
        >
          <button
            onClick={onReset}
            className="px-6 py-3 bg-bg-secondary hover:bg-bg-tertiary border border-border-light rounded-lg font-semibold transition-all duration-300"
          >
            Scan Another Repo
          </button>
          <a
            href={`${API_BASE}/report/${meta.commit}/pdf`}
            className="px-6 py-3 bg-accent-primary hover:bg-accent-secondary text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            Download PDF Report
          </a>
        </div>
      </div>
    </section>
  );
}
