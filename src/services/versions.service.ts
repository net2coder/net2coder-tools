import { supabase } from './supabaseClient'
import type { Version, VersionFormData } from '@/types'

export const versionsService = {
  // ── PUBLIC ────────────────────────────────────────────────
  async getByTool(tool_id: string): Promise<Version[]> {
    const { data, error } = await supabase
      .from('versions')
      .select('*')
      .eq('tool_id', tool_id)
      .order('release_date', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  // ── SECURE DOWNLOAD URL via Edge Function ─────────────────
  // Calls the download-tool Edge Function which:
  //   1. Validates version exists + tool is published
  //   2. Atomically increments download counter + logs
  //   3. Returns a 60-second signed URL for the private bucket
  async getSecureDownloadUrl(version_id: string, tool_id: string): Promise<string> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

    const res = await fetch(`${supabaseUrl}/functions/v1/download-tool`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      },
      body: JSON.stringify({ version_id, tool_id }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(err.error ?? `Download failed (${res.status})`)
    }

    const { url } = await res.json()
    if (!url) throw new Error('No download URL returned')
    return url
  },

  // ── ADMIN: create version ─────────────────────────────────
  async create(tool_id: string, payload: VersionFormData & { zip_path: string }): Promise<Version> {
    if (payload.is_latest) {
      // Unset all other latest flags first
      await supabase
        .from('versions')
        .update({ is_latest: false })
        .eq('tool_id', tool_id)
    }

    const { data, error } = await supabase
      .from('versions')
      .insert([{ ...payload, tool_id }])
      .select()
      .single()
    if (error) throw error
    return data
  },

  // ── ADMIN: update version ─────────────────────────────────
  async update(
    id: string,
    tool_id: string,
    payload: Partial<VersionFormData>
  ): Promise<Version> {
    if (payload.is_latest) {
      await supabase
        .from('versions')
        .update({ is_latest: false })
        .eq('tool_id', tool_id)
    }
    const { data, error } = await supabase
      .from('versions')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // ── ADMIN: delete version ─────────────────────────────────
  async delete(id: string) {
    // Get zip_path to also delete from storage
    const { data: v } = await supabase
      .from('versions')
      .select('zip_path')
      .eq('id', id)
      .single()

    const { error } = await supabase.from('versions').delete().eq('id', id)
    if (error) throw error

    // Clean up storage file
    if (v?.zip_path) {
      await supabase.storage.from('tool-zips').remove([v.zip_path])
    }
  },

  // ── ADMIN: upload ZIP to private bucket ───────────────────
  // Returns the storage path (not the URL) — stored as zip_path
  async uploadZip(file: File, toolSlug: string, versionNumber: string): Promise<string> {
    const ext  = file.name.split('.').pop() ?? 'zip'
    const path = `${toolSlug}/v${versionNumber}.${ext}`

    const { error } = await supabase.storage
      .from('tool-zips')
      .upload(path, file, { upsert: true, contentType: 'application/zip' })

    if (error) throw error
    return path  // Return path, not URL — URL is generated at download time
  },

  // ── ADMIN: set latest via RPC (atomic swap) ───────────────
  async setLatest(version_id: string, tool_id: string) {
    const { error } = await supabase.rpc('set_latest_version', {
      p_version_id: version_id,
      p_tool_id:    tool_id,
    })
    if (error) throw error
  },
}
