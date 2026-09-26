# Agent-Ready Website Specification v0.0.1

> **Philosophy**: Ephemeral Implementation — Spec is the source of truth, code is regenerable.
> Any agent can rewrite the entire codebase as long as all contract tests pass.

## Version History
- v0.0.1: Initial spec-first architecture
  - Added contract tests (92 tests)
  - 50% coverage threshold
  - Machine-readable state machine definition

---

# Agent Ready Website - System Specification

**Philosophy: Ephemeral Implementation**

This document contains the complete, executable specification for the Agent Ready Website. Any agent with access to this document can rebuild the entire system from scratch without reference to the existing codebase.

---

## 1. System Overview

### 1.1 Purpose
A single-page React application that evaluates GitHub repository readiness for AI agent collaboration using the **9 Pillars / 5 Levels** maturity model.

### 1.2 Technology Stack
- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 (warm cream color scheme)
- **Data Visualization**: D3.js 7 (lazy-loaded)
- **Package Manager**: npm
- **Testing**: Vitest 3

### 1.3 Target Environment
- Modern browsers (ES2020+)
- Mobile-responsive design
- API backend consumed via REST

---

## 2. Architecture

### 2.1 Directory Structure
```
src/
├── api/          # API clients and type definitions
├── components/   # React components
├── hooks/        # Custom React hooks
├── constants/    # Shared constants and color schemes
├── data/         # Static data (community reports)
└── App.tsx       # Root application component
```

### 2.2 Core Modules

#### API Layer (`src/api/scan.ts`)
- **Base URL**: `VITE_API_URL` environment variable (default: `/api`)
- **Endpoints**:
  - `POST /api/scan` - Submit scan request
  - `GET /api/scan/:id` - Poll scan status

#### State Management
- React hooks (useState, useCallback, useEffect)
- Custom `useScan` hook for scan lifecycle management
- No external state management library

#### Component Architecture
- Functional components with hooks
- Lazy-loaded chart components for performance
- Error boundaries for chart failures

---

## 3. API Contract

### 3.1 Request/Response Types

```typescript
// ============================================================================
// SCAN REQUEST
// ============================================================================
interface ScanRequest {
  repo_url: string;        // Git repository URL (HTTPS only, see validation rules)
  branch?: string;         // Optional branch name (default: main)
  profile?: string;        // Scan profile (default: 'factory_compat')
}

// ============================================================================
// SCAN RESPONSE (Initial submission)
// ============================================================================
interface ScanResponse {
  scan_id: string;         // Unique scan identifier
  status: 'queued' | 'cloning' | 'scanning' | 'completed' | 'failed';
  poll_url: string;        // URL for status polling
}

// ============================================================================
// SCAN STATUS (Polling responses)
// ============================================================================

// Base properties shared by all status responses
interface ScanStatusBase {
  scan_id: string;
  repo_url: string;
  created_at: string;      // ISO 8601 timestamp
  started_at?: string;     // ISO 8601 timestamp (if scan started)
  duration_ms?: number;    // Milliseconds elapsed
}

// Status: In progress (queued, cloning, scanning)
interface ScanStatusInProgress extends ScanStatusBase {
  status: 'queued' | 'cloning' | 'scanning';
  progress?: number;       // 0-100 percentage (optional)
}

// Status: Completed successfully
interface ScanStatusCompleted extends ScanStatusBase {
  status: 'completed';
  completed_at: string;    // ISO 8601 timestamp
  result: ScanResult;      // Full scan results (see below)
}

// Status: Failed with error
interface ScanStatusFailed extends ScanStatusBase {
  status: 'failed';
  completed_at: string;    // ISO 8601 timestamp
  error: string;           // Error message
}

// Union type for all possible status responses
type ScanStatus = ScanStatusInProgress | ScanStatusCompleted | ScanStatusFailed;

// ============================================================================
// SCAN RESULT (Detailed analysis)
// ============================================================================
interface ScanResult {
  meta: {
    repo: string;          // Repository name (owner/repo)
    commit: string;        // Git commit SHA (full 40 chars)
    timestamp: string;     // ISO 8601 timestamp
    scan_duration_ms: number;
    agents_used: number;   // Number of AI agents used
  };

  executive_summary: {
    level: number | null;  // Overall maturity level (1-5, null if none achieved)
    score: number;         // Overall score (0-100)
    headline: string;      // Human-readable summary
    key_strengths: string[];   // List of strengths
    critical_gaps: string[];   // List of critical issues
    next_steps: string[];      // Recommended actions
  };

  detailed_analysis: {
    pillars: PillarResult[];               // 9 pillar results
    cross_pillar_insights: Array<{
      type: 'risk' | 'opportunity' | 'strength';
      pillars: string[];                   // Affected pillar IDs
      insight: string;
      recommendation: string;
    }>;
    tech_debt_score: number;               // 0-100 (higher = more debt)
  };

  improvement_roadmap: ImprovementRoadmap; // See below

  charts: {
    pillar_radar: Array<{
      pillar: string;      // Pillar ID
      score: number;       // 0-100
    }>;
    level_progress: Array<{
      level: number;       // 1-5
      achieved: boolean;
      score: number;       // 0-100
    }>;
  };
}

// ============================================================================
// PILLAR RESULT
// ============================================================================
interface PillarResult {
  pillar: string;          // Pillar ID (e.g., 'documentation')
  level_achieved: number | null;  // Highest level achieved (1-5, null if none)
  score: number;           // Overall pillar score (0-100)
  icon: string;            // Emoji icon
  name: string;            // Human-readable name
  checks_passed: number;   // Number of checks passed
  checks_total: number;    // Total number of checks
}

// ============================================================================
// IMPROVEMENT ROADMAP
// ============================================================================
interface ImprovementRoadmap {
  quick_wins: ActionItem[];    // 1-2 days
  short_term: ActionItem[];    // 1-2 weeks
  medium_term: ActionItem[];   // 1-2 months
  long_term: ActionItem[];     // 2+ months
}

interface ActionItem {
  pillar: string;          // Pillar ID
  action: string;          // Action description
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}
```

### 3.2 Endpoint Specifications

#### POST /api/scan
**Request Body**: `ScanRequest`

**Response**: `ScanResponse`

**Error Responses**:
- 400 Bad Request: Invalid repository URL or parameters
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Backend failure

#### GET /api/scan/:id
**URL Parameters**: `id` - scan_id from ScanResponse

**Response**: `ScanStatus` (type depends on current status)

**Error Responses**:
- 404 Not Found: Scan ID does not exist
- 500 Internal Server Error: Backend failure

### 3.3 Repository URL Validation

The frontend validates repository URLs using the following rules:

1. **Protocol**: HTTPS only (HTTP allowed only for localhost)
2. **Public hosts** (always allowed):
   - `github.com`
   - `gitlab.com`
   - `bitbucket.org`
3. **Enterprise subdomains** (always allowed):
   - `*.github.com` (e.g., `github.ibm.com`)
   - `*.gitlab.com`
4. **Self-hosted instances** (require 4+ domain parts):
   - Hostname must have 4+ parts (e.g., `gitlab.company.example.com`)
   - First part must be a valid prefix: `git`, `gitlab`, `github`, `gitea`, `bitbucket`, `gogs`, `forgejo`
   - Examples:
     - Valid: `gitlab.corp.example.com`, `git.internal.company.net`
     - Invalid: `git.evil.com` (only 2 parts), `code.company.com` (invalid prefix)

---

## 4. State Machine

### 4.1 Scan Lifecycle (useScan hook)

```
States:
  idle         - No active scan
  loading      - Submitting scan request
  polling      - Waiting for scan completion (polling status)
  completed    - Scan finished successfully
  failed       - Scan or request failed

State Transitions:
  idle → loading          (startScan called)
  loading → polling       (submitScan success, status != completed/failed)
  loading → completed     (submitScan success, status == completed)
  loading → failed        (submitScan error)
  polling → completed     (getScanStatus returns completed)
  polling → failed        (getScanStatus returns failed OR error)
  any → idle              (reset called)

Cancellation:
  - AbortController: Cancel in-flight HTTP requests
  - pollGenerationRef: Prevent stale polling callbacks from updating state
  - Cleanup on unmount or reset
```

### 4.2 Polling Behavior

**Interval**: 2000ms (2 seconds)

**Algorithm**:
1. Submit scan request
2. If status is `queued`, `cloning`, or `scanning`:
   - Wait 2 seconds
   - Poll status endpoint
   - Repeat step 2
3. If status is `completed`:
   - Extract `result` field
   - Transition to completed state
4. If status is `failed`:
   - Extract `error` field
   - Transition to failed state

**Generation-based Cancellation**:
- Each scan increments `pollGenerationRef.current`
- Polling callbacks check generation before updating state
- Prevents race conditions when user starts new scan before previous completes

---

## 5. Component Interfaces

### 5.1 ScanForm

**Purpose**: Collect repository URL and branch from user

**Props**:
```typescript
interface ScanFormProps {
  onSubmit: (repoUrl: string, branch?: string) => void;
  isLoading: boolean;
}
```

**Behavior**:
- Validates URL on submit (see section 3.3)
- Shows error message for invalid URLs
- Disables inputs and button during loading
- Shows spinner when `isLoading` is true

**Form Fields**:
- `repo-url` (input): Repository URL (required)
- `branch` (input): Branch name (optional)

---

### 5.2 LevelBadge

**Purpose**: Display maturity level badge with optional label

**Props**:
```typescript
interface LevelBadgeProps {
  level: number;           // 1-5 (0 for N/A)
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}
```

**Rendering Strategy**:
1. Try to load generated image from `getBadgeUrl(level, size)`
2. On image load error, fallback to inline SVG badge
3. Use `errorUrl` state to track which URL failed (prevents re-attempts)

**Level Configuration**:
```typescript
const LEVEL_CONFIG = {
  1: { name: 'Functional', color: '#ef4444' },   // Red
  2: { name: 'Documented', color: '#f97316' },   // Orange
  3: { name: 'Standardized', color: '#eab308' }, // Yellow
  4: { name: 'Optimized', color: '#22c55e' },    // Green
  5: { name: 'Autonomous', color: '#3b82f6' },   // Blue
};
```

**Size Configuration**:
```typescript
const SIZE_CONFIG = {
  sm: { px: 32, text: 'text-xs' },
  md: { px: 64, text: 'text-sm' },
  lg: { px: 128, text: 'text-base' },
};
```

---

### 5.3 ResultsView

**Purpose**: Display comprehensive scan results with charts and roadmap

**Props**:
```typescript
interface ResultsViewProps {
  result: ScanResult;
  onReset: () => void;
}
```

**Structure** (in order):
1. **Summary Card**:
   - Level badge with pulsing ring animation
   - Headline and overall score
   - Tech debt score (if > 0)
   - Key strengths (max 3, as chips)

2. **Level Progress Chart**:
   - Lazy-loaded `LevelProgressChart` component
   - Shows L1-L5 achievement status

3. **Pillar Analysis Chart**:
   - Toggle between Radar and Bar views
   - Lazy-loaded `RadarChart` or `PillarBarChart`

4. **Pillar Details**:
   - Grid of 9 pillar cards
   - Each card shows: icon, name, level, score, progress bar

5. **Critical Gaps** (if any):
   - Red-bordered warning box
   - List of critical issues

6. **Cross-Pillar Insights** (if any):
   - Categorized by type: risk, opportunity, strength
   - Color-coded borders

7. **Next Steps**:
   - Numbered list of recommendations

8. **Improvement Roadmap**:
   - Accordion with 4 sections: Quick Wins, Short Term, Medium Term, Long Term
   - Each item shows: pillar, impact, effort

9. **Meta Info**:
   - Scan duration, agents used, commit SHA, timestamp

10. **Actions**:
    - "Scan Another Repo" button (calls `onReset`)
    - "Download PDF Report" link (`/api/report/{commit}/pdf`)

**Chart Loading**:
- Lazy-loaded with React.lazy and Suspense
- Shows spinner during load
- Error boundary catches chart load failures

---

### 5.4 ScanProgress

**Purpose**: Show progress indicator during scan

**Props**:
```typescript
interface ScanProgressProps {
  status: 'queued' | 'cloning' | 'scanning';
  repoUrl: string;
}
```

**Rendering**:
- Spinner or progress indicator
- Status message: "Queued", "Cloning repository", "Scanning files"
- Repository URL

---

### 5.5 Chart Components (Lazy-loaded)

#### RadarChart
**Props**:
```typescript
interface RadarChartProps {
  labels: string[];   // 9 pillar names
  values: number[];   // 9 scores (0-100)
}
```

**Rendering**: D3.js radar chart with warm cream colors

---

#### LevelProgressChart
**Props**:
```typescript
interface LevelProgressChartProps {
  data: Array<{
    level: number;      // 1-5
    achieved: boolean;
    score: number;      // 0-100
  }>;
}
```

**Rendering**: Horizontal progress bars for L1-L5

---

#### PillarBarChart
**Props**:
```typescript
interface PillarBarChartProps {
  pillars: PillarResult[];
}
```

**Rendering**: D3.js vertical bar chart with 9 pillars

---

### 5.6 FeaturedRepos

**Purpose**: Display preloaded community reports

**Props**:
```typescript
interface FeaturedReposProps {
  onSelectRepo: (repo: CommunityRepo) => void;
}
```

**Data Source**: `src/data/community-reports.ts`

**Behavior**:
- Grid of repository cards
- Click opens results view with preloaded data
- No API call required

---

## 6. Color System

### 6.1 Tailwind Theme (Warm Cream)

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      // Background layers
      'bg-primary': '#FAF8F5',       // Warm cream (main background)
      'bg-secondary': '#F5F2ED',     // Slightly darker cream
      'bg-tertiary': '#EBE7E0',      // Even darker cream
      'bg-code': '#1e1b18',          // Dark brown (code blocks)

      // Text colors
      'text-primary': '#1A1612',     // Almost black
      'text-secondary': '#5C5348',   // Medium brown
      'text-muted': '#8C8377',       // Light brown

      // Accent colors
      'accent-primary': '#C75D28',   // Burnt orange
      'accent-secondary': '#A84D20', // Darker orange
      'accent-muted': '#E8A57C',     // Light orange

      // Border colors
      'border-light': '#E8E4DE',
      'border-medium': '#D5CEC3',

      // Level colors (L1-L5)
      'level-1': '#ef4444',          // Red
      'level-2': '#f97316',          // Orange
      'level-3': '#eab308',          // Yellow
      'level-4': '#22c55e',          // Green
      'level-5': '#3b82f6',          // Blue
    },
    fontFamily: {
      display: ['Inter', 'system-ui', 'sans-serif'],
      body: ['Inter', 'system-ui', 'sans-serif'],
    },
  },
}
```

### 6.2 D3 Chart Colors

```typescript
// src/constants/colors.ts

// Level colors (used in charts)
export const LEVEL_COLORS = [
  '#94a3b8',  // L0/N/A - gray
  '#ef4444',  // L1 - red
  '#f59e0b',  // L2 - orange
  '#eab308',  // L3 - yellow
  '#22c55e',  // L4 - green
  '#10b981',  // L5 - emerald
];

// Chart theme (matching Tailwind)
export const CHART_COLORS = {
  primary: '#C75D28',              // Burnt orange
  primaryLight: 'rgba(199, 93, 40, 0.2)',
  background: '#FAF8F5',
  grid: '#D5CEC3',
  text: '#5C5348',
  textDark: '#1A1612',
  // ... (see src/constants/colors.ts for full list)
};
```

---

## 7. Design Constraints

### 7.1 Performance Optimizations

1. **Lazy Loading**:
   - D3 chart components are loaded on-demand
   - Reduces initial bundle size
   - Fallback to loading spinner during import

2. **Memoization**:
   - Chart data derived in `useMemo` to avoid recomputation
   - Expensive transformations cached

3. **Request Cancellation**:
   - AbortController cancels in-flight requests on unmount/reset
   - Prevents memory leaks and race conditions

### 7.2 Error Handling

1. **Chart Error Boundaries**:
   - Catch chart rendering errors
   - Show fallback message instead of crashing app

2. **Image Fallbacks**:
   - Badge images fallback to SVG on load error
   - Prevents broken image icons

3. **Network Errors**:
   - API errors shown in red alert box
   - "Try again" button resets state

### 7.3 Animation System

**Stagger Animations**:
- Cards fade in with `animate-fade-in-up` class
- Staggered delays: `style={{ animationDelay: '${index * 50}ms' }}`
- Creates smooth, professional entrance

**Custom Animations** (in App.css):
```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.1; }
  100% { transform: scale(1.2); opacity: 0; }
}

@keyframes pop-in {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
```

---

## 8. Data Flow

### 8.1 Scan Workflow (Happy Path)

```
User enters URL
  ↓
ScanForm validates URL
  ↓
ScanForm calls onSubmit(repoUrl, branch)
  ↓
App calls useScan.startScan(repoUrl, branch)
  ↓
useScan submits POST /api/scan
  ↓
useScan receives ScanResponse with scan_id
  ↓
useScan starts polling GET /api/scan/:id
  ↓
Backend processes scan (status: queued → cloning → scanning)
  ↓
useScan polls every 2 seconds
  ↓
Backend completes scan (status: completed)
  ↓
useScan extracts result from ScanStatus
  ↓
App shows ResultsView with result
```

### 8.2 Error Scenarios

**Invalid URL**:
- ScanForm shows validation error
- No API call made

**Network Error**:
- useScan sets error state
- App shows error alert with "Try again" button

**Backend Failure**:
- useScan polls until status becomes 'failed'
- Shows error message from ScanStatusFailed

**User Cancellation**:
- User calls reset (via "Scan Another Repo" button)
- useScan aborts requests and clears state
- App returns to idle state

---

## 9. Testing Strategy

### 9.1 Unit Tests (Vitest)

**Components**:
- ScanForm: URL validation logic
- LevelBadge: Fallback behavior
- useScan: State transitions and cancellation

**API Client**:
- Mock fetch responses
- Test error handling
- Verify AbortSignal propagation

### 9.2 Type Safety

**TypeScript Strictness**:
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`

**Type Assertions**:
- All API responses typed with interfaces
- No `any` types in application code
- Union types for discriminated status

---

## 10. Build and Deployment

### 10.1 Build Process

```bash
# Development
npm run dev              # Start Vite dev server (port 5173)

# Production
npm run build            # TypeScript check + Vite build
npm run preview          # Preview production build

# Quality Checks
npm run typecheck        # TypeScript only (no emit)
npm run lint             # ESLint
npm run format:check     # Prettier
npm run check            # All three above
```

### 10.2 Environment Variables

```bash
VITE_API_URL             # API base URL (default: /api)
```

### 10.3 Output

**Build Directory**: `dist/`

**Assets**:
- `index.html` - Entry point
- `assets/` - JS, CSS, images (with content hashing)

**Bundle Strategy**:
- Code splitting for D3 charts
- Vendor chunk for React/ReactDOM
- Main chunk for app code

---

## 11. Edge Cases and Gotchas

### 11.1 Polling Race Conditions

**Problem**: User starts new scan while previous scan is polling

**Solution**:
- Increment `pollGenerationRef` on each scan
- Polling callbacks check generation before updating state
- Stale callbacks silently return without effect

### 11.2 Stale Results

**Problem**: User sees old results after failed scan

**Solution**:
- `startScan` clears `result` state immediately
- Only set `result` if generation matches

### 11.3 Chart Load Failures

**Problem**: D3 import fails (network issue, unsupported browser)

**Solution**:
- Error boundary wraps Suspense
- Shows fallback message: "Failed to load chart. Please refresh."

### 11.4 Image Badge Fallback

**Problem**: Badge image URL 404s or fails to load

**Solution**:
- Use `errorUrl` state to track failed URL
- On error, set `errorUrl = imageUrl`
- Render SVG badge when `errorUrl === imageUrl`
- State resets naturally when `imageUrl` changes (new level)

---

## 12. Accessibility

### 12.1 Semantic HTML

- `<header>`, `<main>`, `<section>`, `<footer>` for page structure
- `<form>` with proper labels and ARIA attributes

### 12.2 ARIA Attributes

**ScanForm**:
```html
<input
  aria-label="Repository URL"
  aria-describedby={error ? 'url-error' : undefined}
/>
<p id="url-error" role="alert">{error}</p>
```

**LevelBadge**:
```html
<svg role="img" aria-label="Level 3 badge: Standardized">
```

### 12.3 Keyboard Navigation

- All interactive elements focusable
- Buttons and links have visible focus states
- Accordion (roadmap) keyboard-navigable

---

## 13. Appendix: Full Type Definitions

See section 3.1 for complete API types.

---

## 14. Changelog

**Version 1.0** (2026-01-28):
- Initial specification
- Covers all existing functionality as of React 19 migration

---

## 15. Rebuilding from Spec

To rebuild this system from scratch:

1. **Initialize Project**:
   ```bash
   npm create vite@latest agent-ready-website -- --template react-ts
   cd agent-ready-website
   npm install
   ```

2. **Install Dependencies**:
   ```bash
   npm install react@19 react-dom@19 d3 @types/d3
   npm install -D tailwindcss@4 @tailwindcss/postcss autoprefixer
   npm install -D vitest eslint prettier husky lint-staged
   ```

3. **Configure Tailwind**:
   - Create `tailwind.config.js` with colors from section 6.1
   - Add `@tailwind` directives to `src/index.css`

4. **Implement API Layer**:
   - Create `src/api/scan.ts` with types from section 3.1
   - Implement `submitScan` and `getScanStatus` functions

5. **Implement useScan Hook**:
   - Create `src/hooks/useScan.ts`
   - Implement state machine from section 4.1
   - Implement polling logic from section 4.2

6. **Implement Components**:
   - Follow interfaces from section 5
   - Use color constants from section 6
   - Apply animations from section 7.3

7. **Test**:
   - Write unit tests for critical paths
   - Verify type safety with `npm run typecheck`

8. **Build**:
   ```bash
   npm run build
   ```

This specification is complete and executable. Any ambiguities should be resolved by examining the behavior descriptions in sections 3-7.
