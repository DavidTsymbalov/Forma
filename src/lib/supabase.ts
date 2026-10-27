import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn('Supabase env vars are missing')
}

const memory = new Map<string, string>()

const storage = {
  getItem: async (key: string) => {
    if (window.forma?.authStorage) {
      return window.forma.authStorage.getItem(key)
    }
    return memory.get(key) ?? null
  },
  setItem: async (key: string, value: string) => {
    if (window.forma?.authStorage) {
      await window.forma.authStorage.setItem(key, value)
      return
    }
    memory.set(key, value)
  },
  removeItem: async (key: string) => {
    if (window.forma?.authStorage) {
      await window.forma.authStorage.removeItem(key)
      return
    }
    memory.delete(key)
  },
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    storage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

export type Profile = {
  id: string
  name: string
  avatar_url: string | null
  plan: string
}
