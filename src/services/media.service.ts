import { supabase } from './supabaseClient'

export const mediaService = {
  async uploadImage(file: File, folder: 'logos' | 'banners' | 'steps'): Promise<string> {
    const ext  = file.name.split('.').pop()
    const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage
      .from('tool-assets')
      .upload(name, file, { upsert: true, contentType: file.type })
    if (error) throw error
    const { data } = supabase.storage.from('tool-assets').getPublicUrl(name)
    return data.publicUrl
  },

  async deleteFile(url: string, bucket: 'tool-assets' | 'tool-zips') {
    const path = url.split(`/${bucket}/`)[1]
    if (!path) return
    await supabase.storage.from(bucket).remove([path])
  },

  async listFiles(folder: string) {
    const { data, error } = await supabase.storage
      .from('tool-assets')
      .list(folder, { sortBy: { column: 'created_at', order: 'desc' } })
    if (error) throw error
    return (data ?? []).map(f => ({
      name: f.name,
      url: supabase.storage.from('tool-assets').getPublicUrl(`${folder}/${f.name}`).data.publicUrl,
      size: f.metadata?.size ?? 0,
    }))
  },
}
