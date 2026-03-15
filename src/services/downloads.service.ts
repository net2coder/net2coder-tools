import { supabase } from './supabaseClient'
import { versionsService } from './versions.service'
import type { DashboardStats, Download } from '@/types'

export const downloadsService = {
  // ── PUBLIC: trigger download ──────────────────────────────
  // 1. Calls Edge Function → validates, increments, returns signed URL
  // 2. Triggers browser download
  async download(toolId: string, versionId: string): Promise<void> {
    const signedUrl = await versionsService.getSecureDownloadUrl(versionId, toolId)
    triggerBrowserDownload(signedUrl)
  },

  // ── ADMIN: dashboard stats ────────────────────────────────
  async getDashboardStats(): Promise<DashboardStats> {
    const [statsRes, recentRes] = await Promise.all([
      supabase.rpc('get_tool_stats'),
      supabase
        .from('downloads')
        .select('*')
        .order('downloaded_at', { ascending: false })
        .limit(10),
    ])

    const stats = statsRes.data?.[0] ?? {}

    return {
      totalTools:      Number(stats.total_tools     ?? 0),
      publishedTools:  Number(stats.published_tools ?? 0),
      draftTools:      Number(stats.draft_tools     ?? 0),
      totalVersions:   Number(stats.total_versions  ?? 0),
      totalDownloads:  Number(stats.total_downloads ?? 0),
      recentDownloads: (recentRes.data ?? []) as Download[],
    }
  },

  // ── ADMIN: download trend (last 30 days) ──────────────────
  async getDownloadTrend(): Promise<{ day: string; count: number }[]> {
    const { data, error } = await supabase.rpc('get_download_trend')
    if (error) throw error
    return (data ?? []).map((r: any) => ({
      day:   r.day,
      count: Number(r.count),
    }))
  },

  // ── ADMIN: downloads for a specific tool ─────────────────
  async getForTool(toolId: string, limit = 50): Promise<Download[]> {
    const { data, error } = await supabase
      .from('downloads')
      .select('*')
      .eq('tool_id', toolId)
      .order('downloaded_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data ?? []
  },
}

// Helper: fire-and-forget browser download via temporary anchor
function triggerBrowserDownload(url: string): void {
  const a = document.createElement('a')
  a.href     = url
  a.download = ''
  a.rel      = 'noopener noreferrer'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => document.body.removeChild(a), 100)
}
