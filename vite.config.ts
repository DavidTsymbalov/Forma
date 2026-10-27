import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const authWebUrl = env.VITE_AUTH_WEB_URL || 'http://localhost:3000'

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    plugins: [
      react(),
      electron({
        main: {
          entry: 'electron/main.ts',
          vite: {
            build: {
              outDir: 'dist-electron',
              rollupOptions: {
                output: {
                  inlineDynamicImports: true,
                  entryFileNames: 'main.js',
                },
              },
            },
            define: {
              'process.env.VITE_AUTH_WEB_URL': JSON.stringify(authWebUrl),
            },
          },
        },
        preload: {
          input: 'electron/preload.ts',
          vite: {
            build: {
              outDir: 'dist-electron',
            },
          },
        },
        renderer: {},
      }),
    ],
  }
})
