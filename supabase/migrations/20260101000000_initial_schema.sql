-- ================================================================
-- NET2CODER TOOLS — COMPLETE SUPABASE SCHEMA
-- ================================================================
-- Paste this entire file into Supabase → SQL Editor → Run
-- Replace YOUR_ADMIN_EMAIL with your actual admin email before running
-- ================================================================

-- ── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- TABLES
-- ================================================================

-- ── TOOLS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tools (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT        NOT NULL,
  slug          TEXT        UNIQUE NOT NULL,
  short_desc    TEXT,
  description   TEXT,
  why_built     TEXT,
  logo_url      TEXT,
  banner_url    TEXT,
  status        TEXT        NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'published')),
  category      TEXT        NOT NULL DEFAULT 'extension'
                            CHECK (category IN ('extension','devtool','utility','theme')),
  meta_title    TEXT,
  meta_desc     TEXT,
  github_url    TEXT,
  store_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tools_slug   ON public.tools (slug);
CREATE INDEX IF NOT EXISTS idx_tools_status ON public.tools (status);

-- ── FEATURES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.features (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id       UUID        NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  text          TEXT        NOT NULL,
  icon          TEXT,
  order_index   INTEGER     NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_features_tool ON public.features (tool_id, order_index);

-- ── STEPS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.steps (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id       UUID        NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  title         TEXT,
  description   TEXT,
  image_url     TEXT,
  order_index   INTEGER     NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_steps_tool ON public.steps (tool_id, order_index);

-- ── VERSIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.versions (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id         UUID        NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  version_number  TEXT        NOT NULL,
  zip_path        TEXT        NOT NULL,  -- storage path inside tool-zips bucket
  zip_url         TEXT,                  -- optional: direct URL fallback
  changelog       TEXT,
  is_latest       BOOLEAN     NOT NULL DEFAULT FALSE,
  release_date    DATE        NOT NULL DEFAULT CURRENT_DATE,
  download_count  INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tool_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_versions_tool      ON public.versions (tool_id);
CREATE INDEX IF NOT EXISTS idx_versions_is_latest ON public.versions (tool_id, is_latest);

-- ── DOWNLOADS LOG ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.downloads (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id        UUID        NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  version_id     UUID        NOT NULL REFERENCES public.versions(id) ON DELETE CASCADE,
  ip_address     TEXT,
  user_agent     TEXT,
  downloaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_downloads_tool    ON public.downloads (tool_id);
CREATE INDEX IF NOT EXISTS idx_downloads_version ON public.downloads (version_id);
CREATE INDEX IF NOT EXISTS idx_downloads_date    ON public.downloads (downloaded_at DESC);

-- ── LEGAL PAGES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.legal_pages (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug       TEXT        UNIQUE NOT NULL,
  tool_id    UUID        REFERENCES public.tools(id) ON DELETE SET NULL,
  title      TEXT        NOT NULL,
  content    TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legal_slug ON public.legal_pages (slug);

-- ── SITE SETTINGS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  key        TEXT        UNIQUE NOT NULL,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('site_title',    'Net2Coder Tools'),
  ('site_tagline',  'Browser extensions & developer utilities'),
  ('footer_copy',   '© 2026 Net2Coder. All rights reserved.'),
  ('admin_email',   'YOUR_ADMIN_EMAIL')
ON CONFLICT (key) DO NOTHING;

-- ================================================================
-- FUNCTIONS & TRIGGERS
-- ================================================================

-- ── auto updated_at ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_tools_updated_at
  BEFORE UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_legal_updated_at
  BEFORE UPDATE ON public.legal_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── increment_download (atomic, race-condition safe) ────────
CREATE OR REPLACE FUNCTION public.increment_download(p_version_id UUID, p_tool_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment counter atomically
  UPDATE public.versions
  SET    download_count = download_count + 1
  WHERE  id = p_version_id;

  -- Log the download
  INSERT INTO public.downloads (tool_id, version_id)
  VALUES (p_tool_id, p_version_id);
END;
$$;

-- Grant execute to anonymous (public download tracking)
GRANT EXECUTE ON FUNCTION public.increment_download(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_download(UUID, UUID) TO authenticated;

-- ── set_latest_version (atomic swap) ────────────────────────
CREATE OR REPLACE FUNCTION public.set_latest_version(p_version_id UUID, p_tool_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.versions SET is_latest = FALSE WHERE tool_id = p_tool_id;
  UPDATE public.versions SET is_latest = TRUE  WHERE id = p_version_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_latest_version(UUID, UUID) TO authenticated;

-- ── get_tool_stats (dashboard summary) ──────────────────────
CREATE OR REPLACE FUNCTION public.get_tool_stats()
RETURNS TABLE (
  total_tools      BIGINT,
  published_tools  BIGINT,
  draft_tools      BIGINT,
  total_versions   BIGINT,
  total_downloads  BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*)                                           AS total_tools,
    COUNT(*) FILTER (WHERE status = 'published')      AS published_tools,
    COUNT(*) FILTER (WHERE status = 'draft')          AS draft_tools,
    (SELECT COUNT(*) FROM public.versions)            AS total_versions,
    (SELECT COALESCE(SUM(download_count),0) FROM public.versions) AS total_downloads
  FROM public.tools;
$$;

GRANT EXECUTE ON FUNCTION public.get_tool_stats() TO authenticated;

-- ── get_download_trend (last 30 days by day) ────────────────
CREATE OR REPLACE FUNCTION public.get_download_trend()
RETURNS TABLE (day DATE, count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    DATE(downloaded_at) AS day,
    COUNT(*)            AS count
  FROM public.downloads
  WHERE downloaded_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE(downloaded_at)
  ORDER BY day ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_download_trend() TO authenticated;

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE public.tools         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.steps         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.versions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_pages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ── TOOLS policies ──────────────────────────────────────────
-- Public: read published tools only
CREATE POLICY "tools_public_read"
  ON public.tools FOR SELECT
  USING (status = 'published');

-- Admin: full CRUD (authenticated + email matches)
CREATE POLICY "tools_admin_all"
  ON public.tools FOR ALL
  TO authenticated
  USING (
    (SELECT value FROM public.site_settings WHERE key = 'admin_email' LIMIT 1)
    = auth.jwt() ->> 'email'
  )
  WITH CHECK (
    (SELECT value FROM public.site_settings WHERE key = 'admin_email' LIMIT 1)
    = auth.jwt() ->> 'email'
  );

-- ── FEATURES policies ───────────────────────────────────────
CREATE POLICY "features_public_read"
  ON public.features FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tools
      WHERE id = tool_id AND status = 'published'
    )
  );

CREATE POLICY "features_admin_all"
  ON public.features FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── STEPS policies ──────────────────────────────────────────
CREATE POLICY "steps_public_read"
  ON public.steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tools
      WHERE id = tool_id AND status = 'published'
    )
  );

CREATE POLICY "steps_admin_all"
  ON public.steps FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── VERSIONS policies ───────────────────────────────────────
CREATE POLICY "versions_public_read"
  ON public.versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tools
      WHERE id = tool_id AND status = 'published'
    )
  );

CREATE POLICY "versions_admin_all"
  ON public.versions FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── DOWNLOADS policies ──────────────────────────────────────
-- Anyone can insert a download record
CREATE POLICY "downloads_public_insert"
  ON public.downloads FOR INSERT
  WITH CHECK (true);

-- Only admin can read download logs
CREATE POLICY "downloads_admin_read"
  ON public.downloads FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

-- ── LEGAL PAGES policies ────────────────────────────────────
CREATE POLICY "legal_public_read"
  ON public.legal_pages FOR SELECT
  USING (true);

CREATE POLICY "legal_admin_all"
  ON public.legal_pages FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── SITE SETTINGS policies ──────────────────────────────────
CREATE POLICY "settings_public_read"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "settings_admin_all"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ================================================================
-- STORAGE BUCKETS
-- ================================================================

-- Create tool-assets bucket (public - logos, banners, step images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tool-assets',
  'tool-assets',
  TRUE,
  5242880,  -- 5MB limit
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 5242880;

-- Create tool-zips bucket (private - extension zip files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tool-zips',
  'tool-zips',
  FALSE,
  52428800,  -- 50MB limit
  ARRAY['application/zip','application/x-zip-compressed','application/octet-stream']
)
ON CONFLICT (id) DO UPDATE SET
  public = FALSE,
  file_size_limit = 52428800;

-- ── STORAGE POLICIES: tool-assets (public read) ─────────────

DROP POLICY IF EXISTS "assets_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "assets_admin_upload"  ON storage.objects;
DROP POLICY IF EXISTS "assets_admin_update"  ON storage.objects;
DROP POLICY IF EXISTS "assets_admin_delete"  ON storage.objects;

CREATE POLICY "assets_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tool-assets');

CREATE POLICY "assets_admin_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'tool-assets');

CREATE POLICY "assets_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'tool-assets');

CREATE POLICY "assets_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'tool-assets');

-- ── STORAGE POLICIES: tool-zips (private, signed URLs only) ─

DROP POLICY IF EXISTS "zips_admin_upload"    ON storage.objects;
DROP POLICY IF EXISTS "zips_admin_read"      ON storage.objects;
DROP POLICY IF EXISTS "zips_admin_delete"    ON storage.objects;

-- Only admin can upload zips
CREATE POLICY "zips_admin_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'tool-zips');

-- Only admin can read zip list (signed URLs generated server-side)
CREATE POLICY "zips_admin_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'tool-zips');

CREATE POLICY "zips_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'tool-zips');

-- ================================================================
-- AUTH SETUP NOTES
-- ================================================================
-- After running this SQL:
--
-- 1. Go to Authentication → Settings
--    - Disable "Enable email confirmations" (optional for dev)
--    - Disable "Enable sign up" → to block public signups
--
-- 2. Go to Authentication → Users → Add user
--    - Add YOUR email + strong password
--    - This is your only admin account
--
-- 3. Update admin_email in site_settings:
UPDATE public.site_settings
SET value = 'YOUR_ADMIN_EMAIL'
WHERE key = 'admin_email';
--    Replace YOUR_ADMIN_EMAIL above with your real email
--
-- ================================================================
-- VERIFICATION QUERIES (run after setup to confirm everything)
-- ================================================================

-- Check tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies
-- SELECT schemaname, tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public';

-- Check storage buckets
-- SELECT id, name, public FROM storage.buckets;

-- Check functions
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';

-- Test increment_download (replace with real UUIDs after creating test data)
-- SELECT public.increment_download('00000000-0000-0000-0000-000000000001'::UUID, '00000000-0000-0000-0000-000000000001'::UUID);

-- Test stats function
-- SELECT * FROM public.get_tool_stats();
