-- =============================================
-- Run ini di Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Run
-- =============================================

-- Links milik tiap user
CREATE TABLE IF NOT EXISTS tracker_links (
  id          TEXT PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_url  TEXT NOT NULL,
  title       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  click_count INTEGER DEFAULT 0
);

-- Log tiap klik
CREATE TABLE IF NOT EXISTS tracker_clicks (
  id           BIGSERIAL PRIMARY KEY,
  link_id      TEXT NOT NULL REFERENCES tracker_links(id) ON DELETE CASCADE,
  ip           TEXT,
  country      TEXT,
  country_code TEXT,
  city         TEXT,
  region       TEXT,
  isp          TEXT,
  asn          TEXT,
  timezone     TEXT,
  latitude     DOUBLE PRECISION,
  longitude    DOUBLE PRECISION,
  user_agent   TEXT,
  browser      TEXT,
  os           TEXT,
  device       TEXT,
  referer      TEXT,
  clicked_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clicks_link_id    ON tracker_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON tracker_clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_links_user_id     ON tracker_links(user_id);

-- Auto increment click_count
CREATE OR REPLACE FUNCTION increment_click_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tracker_links SET click_count = click_count + 1 WHERE id = NEW.link_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_click_insert ON tracker_clicks;
CREATE TRIGGER on_click_insert
  AFTER INSERT ON tracker_clicks
  FOR EACH ROW EXECUTE FUNCTION increment_click_count();

-- =============================================
-- Row Level Security
-- =============================================
ALTER TABLE tracker_links  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracker_clicks ENABLE ROW LEVEL SECURITY;

-- Links: user hanya bisa CRUD milik sendiri
CREATE POLICY "links_select" ON tracker_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "links_insert" ON tracker_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "links_delete" ON tracker_links FOR DELETE USING (auth.uid() = user_id);

-- Clicks: user hanya bisa baca klik dari link miliknya
CREATE POLICY "clicks_select" ON tracker_clicks FOR SELECT
  USING (EXISTS (SELECT 1 FROM tracker_links WHERE id = link_id AND user_id = auth.uid()));

-- Clicks: service role boleh insert (dari redirect handler pakai service key)
CREATE POLICY "clicks_insert_service" ON tracker_clicks FOR INSERT
  WITH CHECK (true);
