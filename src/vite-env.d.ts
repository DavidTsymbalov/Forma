/// <reference types="vite/client" />

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

interface FormaBridge {
  platform: NodeJS.Platform
  authStorage: {
    getItem: (key: string) => Promise<string | null>
    setItem: (key: string, value: string) => Promise<void>
    removeItem: (key: string) => Promise<void>
  }
  clearAuthStorage: () => Promise<void>
  openAuth: (pathName: 'login' | 'register') => Promise<void>
  onAuthDeepLink: (callback: (tokens: AuthTokens) => void) => () => void
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_AUTH_WEB_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    forma?: FormaBridge
  }
}

export {}
