-- Agent Ready Database Schema
-- PostgreSQL 16+

-- Scans table - stores scan requests and results
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_url TEXT NOT NULL,
  branch TEXT,
  profile TEXT NOT NULL DEFAULT 'factory_compat',
  language VARCHAR(2) NOT NULL DEFAULT 'en',
  status VARCHAR(20) NOT NULL DEFAULT 'queued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  result JSONB,
  error TEXT,

  -- Indexes for common queries
  CONSTRAINT valid_status CHECK (status IN ('queued', 'cloning', 'scanning', 'completed', 'failed')),
  CONSTRAINT valid_language CHECK (language IN ('zh', 'en'))
);

-- Index for status polling
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_repo_url ON scans(repo_url);

-- Users table (for future auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  github_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- User scans relationship
CREATE TABLE IF NOT EXISTS user_scans (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, scan_id)
);

-- Repositories table - cache repo metadata
CREATE TABLE IF NOT EXISTS repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  description TEXT,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  language TEXT,
  last_scanned_at TIMESTAMPTZ,
  scan_count INTEGER DEFAULT 0,
  avg_score DECIMAL(5,2),
  highest_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repositories_owner ON repositories(owner);
CREATE INDEX IF NOT EXISTS idx_repositories_scan_count ON repositories(scan_count DESC);

-- Scan history for trending/analytics
CREATE TABLE IF NOT EXISTS scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
  repo_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  level_achieved INTEGER NOT NULL,
  overall_score DECIMAL(5,2) NOT NULL,
  pillar_scores JSONB NOT NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scan_history_repo ON scan_history(repo_id, scanned_at DESC);

-- Function to update repository stats after scan
CREATE OR REPLACE FUNCTION update_repo_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE repositories
  SET
    last_scanned_at = NOW(),
    scan_count = scan_count + 1,
    updated_at = NOW()
  WHERE url = (SELECT repo_url FROM scans WHERE id = NEW.scan_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update repo stats
CREATE TRIGGER trigger_update_repo_stats
AFTER INSERT ON scan_history
FOR EACH ROW
EXECUTE FUNCTION update_repo_stats();
