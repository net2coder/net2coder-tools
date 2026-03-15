-- ================================================================
-- NET2CODER TOOLS — SEED DATA (Development Only)
-- Run after schema.sql to populate example data
-- ================================================================

-- Clear existing data (dev only - NEVER run on production)
-- TRUNCATE public.downloads, public.versions, public.steps,
--          public.features, public.tools RESTART IDENTITY CASCADE;

-- ── EXAMPLE TOOL 1: Neo Tab ─────────────────────────────────
INSERT INTO public.tools (
  id, title, slug, short_desc, description, why_built,
  status, category, github_url,
  meta_title, meta_desc
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Neo Tab',
  'neo-tab',
  'A clean, distraction-free new tab page that shows time, date, and a daily focus goal.',
  'Neo Tab replaces your browser''s default new tab with a minimal, focused experience. No ads, no news feed, no distractions. Just the time, your focus goal for the day, and a clean dark background.',
  'I was tired of opening a new tab and being bombarded with news articles and ads. I wanted something clean and intentional. So I built Neo Tab — a minimal new tab that helps you stay focused on what matters.',
  'published',
  'extension',
  'https://github.com/net2coder/neo-tab',
  'Neo Tab – Clean New Tab Extension',
  'A minimal, distraction-free new tab page for Chrome. Shows time, date, and daily focus goal. No ads, open-source.'
) ON CONFLICT (slug) DO NOTHING;

-- Features for Neo Tab
INSERT INTO public.features (tool_id, text, order_index) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Clean dark theme — easy on the eyes at any hour', 0),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Set a daily focus goal that greets you every tab', 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Live clock with seconds — always accurate', 2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Zero network requests — fully offline capable', 3),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'No data collection, no telemetry, no analytics', 4),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Lightweight — loads in under 50ms', 5)
ON CONFLICT DO NOTHING;

-- Steps for Neo Tab
INSERT INTO public.steps (tool_id, title, description, order_index) VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Open a new tab',
    'After installing, open any new tab in Chrome. Neo Tab immediately replaces the default new tab page.',
    0
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Set your daily focus',
    'Click the focus field and type what you want to accomplish today. It saves automatically and persists until you change it.',
    1
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Stay in flow',
    'Every time you open a new tab, you see your goal front and center — keeping you anchored to your priority for the day.',
    2
  )
ON CONFLICT DO NOTHING;

-- Version for Neo Tab (no zip_path since this is just seed data)
INSERT INTO public.versions (
  tool_id, version_number, zip_path,
  changelog, is_latest, release_date, download_count
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '1.2.0',
  'neo-tab/v1.2.0.zip',
  '- Added daily focus goal persistence across sessions
- Improved dark theme contrast
- Reduced bundle size by 40%
- Fixed clock timezone edge case on DST change',
  TRUE,
  '2026-01-15',
  247
) ON CONFLICT (tool_id, version_number) DO NOTHING;

INSERT INTO public.versions (
  tool_id, version_number, zip_path,
  changelog, is_latest, release_date, download_count
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '1.1.0',
  'neo-tab/v1.1.0.zip',
  '- Added seconds display to clock
- Smooth fade-in animation on load
- Fixed Safari compatibility issue',
  FALSE,
  '2025-11-20',
  183
) ON CONFLICT (tool_id, version_number) DO NOTHING;

-- ── EXAMPLE TOOL 2: Code Clip ──────────────────────────────
INSERT INTO public.tools (
  id, title, slug, short_desc, description, why_built,
  status, category, github_url,
  meta_title, meta_desc
) VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Code Clip',
  'code-clip',
  'Right-click any selected code on any webpage and copy it as a clean, formatted snippet.',
  'Code Clip adds a context menu option to any selected text on the web. When you highlight code, right-click, and choose "Copy as Code Snippet" — it formats it with the language, source URL, and timestamp, ready to paste into your notes.',
  'I kept copying code from documentation pages and losing track of where it came from. Code Clip solves that by automatically attaching the source URL to every copied snippet.',
  'published',
  'extension',
  'https://github.com/net2coder/code-clip',
  'Code Clip – Smart Code Copy Extension',
  'Right-click any code on any webpage to copy it as a formatted snippet with source URL and language. Open-source Chrome extension.'
) ON CONFLICT (slug) DO NOTHING;

-- Features for Code Clip
INSERT INTO public.features (tool_id, text, order_index) VALUES
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Right-click context menu on any selected text', 0),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Auto-detects programming language', 1),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Attaches source URL and timestamp', 2),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Copies in Markdown code block format', 3),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Works on GitHub, MDN, Stack Overflow, and more', 4)
ON CONFLICT DO NOTHING;

-- Version for Code Clip
INSERT INTO public.versions (
  tool_id, version_number, zip_path,
  changelog, is_latest, release_date, download_count
) VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  '1.0.1',
  'code-clip/v1.0.1.zip',
  '- Fixed context menu not appearing on some sites
- Added Markdown output format option
- Improved language detection accuracy',
  TRUE,
  '2026-02-01',
  89
) ON CONFLICT (tool_id, version_number) DO NOTHING;

-- ── LEGAL PAGES ─────────────────────────────────────────────
INSERT INTO public.legal_pages (slug, tool_id, title, content) VALUES
  (
    'neo-tab-privacy',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Neo Tab — Privacy Policy',
    '## Privacy Policy

Last updated: January 2026

Neo Tab does not collect, store, or transmit any personal information.

## Data Storage

All data (your focus goal, preferences) is stored locally in your browser using the Chrome Storage API. This data never leaves your device and is not accessible to us.

## No Analytics

Neo Tab contains no analytics, telemetry, or tracking code of any kind.

## No Network Requests

Neo Tab makes zero network requests. It works completely offline.

## Contact

For privacy concerns, please visit net2coder.in.'
  ),
  (
    'neo-tab-terms',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Neo Tab — Terms of Use',
    '## Terms of Use

Last updated: January 2026

By installing Neo Tab, you agree to these terms.

## License

Neo Tab is provided under the MIT License. You are free to use, copy, modify, and distribute it.

## No Warranty

Neo Tab is provided as-is, without warranty of any kind. We are not liable for any damages arising from its use.

## Updates

We may update Neo Tab at any time. Continued use constitutes acceptance of any changes.'
  )
ON CONFLICT (slug) DO NOTHING;

-- ── SAMPLE DOWNLOAD LOGS ────────────────────────────────────
-- Simulate some historical downloads for dashboard display
INSERT INTO public.downloads (tool_id, version_id, downloaded_at)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  (SELECT id FROM public.versions WHERE tool_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND is_latest = TRUE LIMIT 1),
  NOW() - (INTERVAL '1 day' * generate_series)
FROM generate_series(0, 9)
WHERE EXISTS (
  SELECT 1 FROM public.versions
  WHERE tool_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND is_latest = TRUE
);

-- ================================================================
-- VERIFY SEED DATA
-- ================================================================
-- SELECT title, slug, status FROM public.tools;
-- SELECT tool_id, version_number, is_latest, download_count FROM public.versions;
-- SELECT slug, title FROM public.legal_pages;
