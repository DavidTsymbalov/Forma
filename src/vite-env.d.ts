/// <reference types="vite/client" />

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

type AiModelChoice = 'Auto' | 'Claude' | 'GPT' | 'Gemini'

type ChatMessageInput = {
  role: 'user' | 'assistant' | 'system'
  content: string
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
  streamAi: (payload: {
    requestId: string
    model: AiModelChoice
    messages: ChatMessageInput[]
  }) => Promise<{ ok: true; text: string } | { ok: false; message: string }>
  cancelAi: (requestId: string) => Promise<void>
  onAiChunk: (callback: (payload: { requestId: string; text: string }) => void) => () => void
  onAiDone: (callback: (payload: { requestId: string; text: string }) => void) => () => void
  onAiError: (callback: (payload: { requestId: string; message: string }) => void) => () => void
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
