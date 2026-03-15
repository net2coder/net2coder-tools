import { supabase } from './supabaseClient'
import type { Step } from '@/types'

export const stepsService = {
  async getByTool(tool_id: string): Promise<Step[]> {
    const { data, error } = await supabase
      .from('steps')
      .select('*')
      .eq('tool_id', tool_id)
      .order('order_index')
    if (error) throw error
    return data ?? []
  },

  async upsertMany(tool_id: string, steps: Omit<Step, 'id'>[]) {
    await supabase.from('steps').delete().eq('tool_id', tool_id)
    if (steps.length === 0) return
    const { error } = await supabase.from('steps').insert(
      steps.map((s, i) => ({ ...s, tool_id, order_index: i }))
    )
    if (error) throw error
  },

  async delete(id: string) {
    const { error } = await supabase.from('steps').delete().eq('id', id)
    if (error) throw error
  },
}
