import { contextBridge, ipcRenderer } from 'electron'

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type AiModelChoice = 'Auto' | 'Claude' | 'GPT' | 'Gemini'

export type ChatMessageInput = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

contextBridge.exposeInMainWorld('forma', {
  platform: process.platform,
  authStorage: {
    getItem: (key: string) => ipcRenderer.invoke('auth:storage:get', key) as Promise<string | null>,
    setItem: (key: string, value: string) =>
      ipcRenderer.invoke('auth:storage:set', key, value) as Promise<void>,
    removeItem: (key: string) => ipcRenderer.invoke('auth:storage:remove', key) as Promise<void>,
  },
  clearAuthStorage: () => ipcRenderer.invoke('auth:storage:clear') as Promise<void>,
  openAuth: (pathName: 'login' | 'register') =>
    ipcRenderer.invoke('auth:open', pathName) as Promise<void>,
  onAuthDeepLink: (callback: (tokens: AuthTokens) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, tokens: AuthTokens) => {
      callback(tokens)
    }
    ipcRenderer.on('auth:deep-link', listener)
    return () => {
      ipcRenderer.removeListener('auth:deep-link', listener)
    }
  },
  streamAi: (payload: {
    requestId: string
    model: AiModelChoice
    messages: ChatMessageInput[]
  }) =>
    ipcRenderer.invoke('ai:stream', payload) as Promise<
      { ok: true; text: string } | { ok: false; message: string }
    >,
  cancelAi: (requestId: string) => ipcRenderer.invoke('ai:cancel', requestId) as Promise<void>,
  onAiChunk: (callback: (payload: { requestId: string; text: string }) => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      payload: { requestId: string; text: string },
    ) => callback(payload)
    ipcRenderer.on('ai:chunk', listener)
    return () => ipcRenderer.removeListener('ai:chunk', listener)
  },
  onAiDone: (callback: (payload: { requestId: string; text: string }) => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      payload: { requestId: string; text: string },
    ) => callback(payload)
    ipcRenderer.on('ai:done', listener)
    return () => ipcRenderer.removeListener('ai:done', listener)
  },
  onAiError: (callback: (payload: { requestId: string; message: string }) => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      payload: { requestId: string; message: string },
    ) => callback(payload)
    ipcRenderer.on('ai:error', listener)
    return () => ipcRenderer.removeListener('ai:error', listener)
  },
})
