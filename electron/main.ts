import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  authStorageClear,
  authStorageGet,
  authStorageRemove,
  authStorageSet,
} from './auth-store'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

const PROTOCOL = 'forma'
const AUTH_WEB_URL = process.env.VITE_AUTH_WEB_URL || 'http://localhost:3000'

let mainWindow: BrowserWindow | null = null
let pendingDeepLink: string | null = null

function registerProtocol() {
  if (process.defaultApp) {
    const appPath = path.resolve(process.argv[1] ?? '.')
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [appPath])
    return
  }
  app.setAsDefaultProtocolClient(PROTOCOL)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1280,
    minHeight: 800,
    show: false,
    frame: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 14 },
    transparent: true,
    backgroundColor: '#00000000',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    roundedCorners: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    if (pendingDeepLink) {
      handleDeepLink(pendingDeepLink)
      pendingDeepLink = null
    }
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

function parseAuthDeepLink(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== `${PROTOCOL}:`) return null
    if (parsed.hostname !== 'auth' && parsed.pathname.replace(/^\//, '') !== 'auth') {
      // forma://auth?... → hostname is "auth"
      if (parsed.hostname !== 'auth') return null
    }

    const accessToken = parsed.searchParams.get('access_token')
    const refreshToken = parsed.searchParams.get('refresh_token')
    if (!accessToken || !refreshToken) return null
    return { accessToken, refreshToken }
  } catch {
    return null
  }
}

function handleDeepLink(url: string) {
  const tokens = parseAuthDeepLink(url)
  if (!tokens) return

  if (!mainWindow) {
    pendingDeepLink = url
    return
  }

  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.focus()
  mainWindow.webContents.send('auth:deep-link', tokens)
}

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    const url = argv.find((arg) => arg.startsWith(`${PROTOCOL}://`))
    if (url) handleDeepLink(url)
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    registerProtocol()

    ipcMain.handle('auth:storage:get', (_event, key: string) => authStorageGet(key))
    ipcMain.handle('auth:storage:set', (_event, key: string, value: string) => {
      authStorageSet(key, value)
    })
    ipcMain.handle('auth:storage:remove', (_event, key: string) => {
      authStorageRemove(key)
    })
    ipcMain.handle('auth:storage:clear', () => {
      authStorageClear()
    })
    ipcMain.handle('auth:open', async (_event, pathName: 'login' | 'register') => {
      const url = `${AUTH_WEB_URL.replace(/\/$/, '')}/${pathName}?next=desktop`
      await shell.openExternal(url)
    })

    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })

  app.on('open-url', (event, url) => {
    event.preventDefault()
    handleDeepLink(url)
  })

  // Cold start on Windows/Linux may pass protocol URL in argv
  const argvLink = process.argv.find((arg) => arg.startsWith(`${PROTOCOL}://`))
  if (argvLink) pendingDeepLink = argvLink
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  mainWindow = null
})
