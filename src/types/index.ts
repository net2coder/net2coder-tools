// ── CORE ENTITIES ───────────────────────────────────────────

export interface Tool {
  id: string
  title: string
  slug: string
  short_desc: string | null
  description: string | null
  why_built: string | null
  logo_url: string | null
  banner_url: string | null
  status: 'draft' | 'published'
  category: string
  meta_title: string | null
  meta_desc: string | null
  github_url: string | null
  store_url: string | null
  created_at: string
  updated_at: string
  // joined
  features?: Feature[]
  steps?: Step[]
  versions?: Version[]
}

export interface Feature {
  id: string
  tool_id: string
  text: string
  icon: string | null
  order_index: number
}

export interface Step {
  id: string
  tool_id: string
  title: string | null
  description: string | null
  image_url: string | null
  order_index: number
}

export interface Version {
  id: string
  tool_id: string
  version_number: string
  zip_path: string       // storage path inside tool-zips bucket
  zip_url?: string       // optional direct URL (legacy / fallback)
  changelog: string | null
  is_latest: boolean
  release_date: string
  download_count: number
  created_at: string
}

export interface Download {
  id: string
  tool_id: string
  version_id: string
  ip_address: string | null
  user_agent: string | null
  downloaded_at: string
}

export interface LegalPage {
  id: string
  slug: string
  tool_id: string | null
  title: string
  content: string | null
  updated_at: string
}

export interface SiteSetting {
  id: string
  key: string
  value: string | null
  updated_at: string
}

// ── FORM TYPES ──────────────────────────────────────────────

export interface ToolFormData {
  title: string
  slug: string
  short_desc: string
  description: string
  why_built: string
  status: 'draft' | 'published'
  category: string
  meta_title: string
  meta_desc: string
  github_url: string
  store_url: string
}

export interface VersionFormData {
  version_number: string
  zip_path: string
  changelog: string
  is_latest: boolean
  release_date: string
}

export interface LegalPageFormData {
  title: string
  content: string
  slug: string
  tool_id: string | null
}

// ── DASHBOARD STATS ─────────────────────────────────────────

export interface DashboardStats {
  totalTools: number
  publishedTools: number
  draftTools: number
  totalVersions: number
  totalDownloads: number
  recentDownloads: Download[]
}
