import { contextBridge, ipcRenderer } from 'electron'

export type AuthTokens = {
  accessToken: string
  refreshToken: string
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
})
