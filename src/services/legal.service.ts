import { supabase } from './supabaseClient'
import type { LegalPage, LegalPageFormData } from '@/types'

export const legalService = {
  async getAll(): Promise<LegalPage[]> {
    const { data, error } = await supabase
      .from('legal_pages')
      .select('*')
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async getBySlug(slug: string): Promise<LegalPage | null> {
    const { data } = await supabase
      .from('legal_pages')
      .select('*')
      .eq('slug', slug)
      .single()
    return data ?? null
  },

  async upsert(payload: LegalPageFormData): Promise<LegalPage> {
    const { data, error } = await supabase
      .from('legal_pages')
      .upsert([payload], { onConflict: 'slug' })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase.from('legal_pages').delete().eq('id', id)
    if (error) throw error
  },
}
