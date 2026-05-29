import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ mode }) => {
  const isPagesBuild = mode === 'pages'
  const isTauriBuild = mode === 'tauri'
  const useHttps = mode === 'https'

  return {
    base: isPagesBuild ? '/pharmaproject/' : isTauriBuild ? './' : '/',
    plugins: [react(), useHttps && basicSsl()].filter(Boolean),
    server: {
      host: useHttps ? '0.0.0.0' : '127.0.0.1',
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
        '/static': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
