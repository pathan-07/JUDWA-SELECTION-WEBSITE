-- 006: Website visit tracking (shown on the admin dashboard and analytics page).
-- Run in the Supabase SQL editor after 005.

CREATE TABLE IF NOT EXISTS site_visits (
  id BIGSERIAL PRIMARY KEY,
  visitor_id VARCHAR(64) NOT NULL, -- random id kept in the visitor's browser (no personal data)
  path VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_visits_created ON site_visits(created_at);

-- Only the server (service-role key) reads/writes visits
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
