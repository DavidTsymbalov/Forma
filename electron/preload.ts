import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('forma', {
  platform: process.platform,
})
