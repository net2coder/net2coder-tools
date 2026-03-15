import { supabase } from './supabaseClient'
import type { Tool, ToolFormData } from '@/types'

export const toolsService = {
  // ── PUBLIC ─────────────────────────────────────────────
  async getAll(): Promise<Tool[]> {
    const { data, error } = await supabase
      .from('tools')
      .select('*, versions(id, version_number, is_latest, download_count, release_date)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async getBySlug(slug: string): Promise<Tool | null> {
    const { data, error } = await supabase
      .from('tools')
      .select(`
        *,
        features ( * ),
        steps ( * ),
        versions ( * )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    if (error) return null
    if (!data) return null
    // sort by order_index
    if (data.features) data.features.sort((a: any, b: any) => a.order_index - b.order_index)
    if (data.steps)    data.steps.sort((a: any, b: any) => a.order_index - b.order_index)
    if (data.versions) data.versions.sort((a: any, b: any) =>
      new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
    )
    return data
  },

  // ── ADMIN ──────────────────────────────────────────────
  async adminGetAll(): Promise<Tool[]> {
    const { data, error } = await supabase
      .from('tools')
      .select('*, versions(id, download_count)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async adminGetById(id: string): Promise<Tool | null> {
    const { data, error } = await supabase
      .from('tools')
      .select(`*, features(*), steps(*), versions(*)`)
      .eq('id', id)
      .single()
    if (error) return null
    if (data?.features) data.features.sort((a: any, b: any) => a.order_index - b.order_index)
    if (data?.steps)    data.steps.sort((a: any, b: any) => a.order_index - b.order_index)
    return data
  },

  async create(payload: ToolFormData): Promise<Tool> {
    const { data, error } = await supabase
      .from('tools')
      .insert([payload])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, payload: Partial<ToolFormData>): Promise<Tool> {
    const { data, error } = await supabase
      .from('tools')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateLogoUrl(id: string, logo_url: string) {
    const { error } = await supabase.from('tools').update({ logo_url }).eq('id', id)
    if (error) throw error
  },

  async updateBannerUrl(id: string, banner_url: string) {
    const { error } = await supabase.from('tools').update({ banner_url }).eq('id', id)
    if (error) throw error
  },

  async toggleStatus(id: string, status: 'draft' | 'published') {
    const { error } = await supabase.from('tools').update({ status }).eq('id', id)
    if (error) throw error
  },

  async delete(id: string) {
    const { error } = await supabase.from('tools').delete().eq('id', id)
    if (error) throw error
  },

  // ── SLUG CHECK ────────────────────────────────────────
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    let q = supabase.from('tools').select('id').eq('slug', slug)
    if (excludeId) q = q.neq('id', excludeId)
    const { data } = await q
    return (data?.length ?? 0) > 0
  },
}
