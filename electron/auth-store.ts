import { app, safeStorage } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

function storePath() {
  return path.join(app.getPath('userData'), 'auth-store.bin')
}

function readStore(): Record<string, string> {
  const file = storePath()
  if (!fs.existsSync(file)) return {}

  try {
    const raw = fs.readFileSync(file)
    if (safeStorage.isEncryptionAvailable()) {
      return JSON.parse(safeStorage.decryptString(raw)) as Record<string, string>
    }
    return JSON.parse(raw.toString('utf8')) as Record<string, string>
  } catch {
    return {}
  }
}

function writeStore(data: Record<string, string>) {
  const json = JSON.stringify(data)
  const file = storePath()
  if (safeStorage.isEncryptionAvailable()) {
    fs.writeFileSync(file, safeStorage.encryptString(json))
    return
  }
  fs.writeFileSync(file, json, 'utf8')
}

export function authStorageGet(key: string) {
  return readStore()[key] ?? null
}

export function authStorageSet(key: string, value: string) {
  const data = readStore()
  data[key] = value
  writeStore(data)
}

export function authStorageRemove(key: string) {
  const data = readStore()
  delete data[key]
  writeStore(data)
}

export function authStorageClear() {
  const file = storePath()
  if (fs.existsSync(file)) {
    fs.unlinkSync(file)
  }
}
