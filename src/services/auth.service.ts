import { supabase } from './supabaseClient'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.user?.email !== ADMIN_EMAIL) {
      await supabase.auth.signOut()
      throw new Error('Unauthorized: not an admin account')
    }
    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  },

  async getUser() {
    const { data } = await supabase.auth.getUser()
    return data.user
  },

  isAdmin(email: string | null | undefined): boolean {
    return email === ADMIN_EMAIL
  },

  onAuthStateChange(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session)
    })
  },
}
