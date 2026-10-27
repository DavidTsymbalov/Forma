/// <reference types="vite/client" />

interface FormaBridge {
  platform: NodeJS.Platform
}

declare global {
  interface Window {
    forma?: FormaBridge
  }
}

export {}
