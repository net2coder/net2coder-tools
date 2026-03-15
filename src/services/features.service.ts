import { supabase } from './supabaseClient'
import type { Feature } from '@/types'

export const featuresService = {
  async getByTool(tool_id: string): Promise<Feature[]> {
    const { data, error } = await supabase
      .from('features')
      .select('*')
      .eq('tool_id', tool_id)
      .order('order_index')
    if (error) throw error
    return data ?? []
  },

  async upsertMany(tool_id: string, features: Omit<Feature, 'id'>[]) {
    // delete old, insert new — simple strategy
    await supabase.from('features').delete().eq('tool_id', tool_id)
    if (features.length === 0) return
    const { error } = await supabase.from('features').insert(
      features.map((f, i) => ({ ...f, tool_id, order_index: i }))
    )
    if (error) throw error
  },

  async delete(id: string) {
    const { error } = await supabase.from('features').delete().eq('id', id)
    if (error) throw error
  },
}
