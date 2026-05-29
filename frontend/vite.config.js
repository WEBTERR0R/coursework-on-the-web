import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

const env = globalThis.process?.env || {}

export default defineConfig(({ mode }) => {
  const isPagesBuild = mode === 'pages'
  const isTauriBuild = mode === 'tauri'
  const useHttps = mode === 'https'
  const repositoryName = env.GITHUB_REPOSITORY?.split('/')[1]
  const pagesBasePath = env.VITE_BASE_PATH || (repositoryName ? `/${repositoryName}/` : '/coursework-on-the-web/')

  return {
    base: isPagesBuild ? pagesBasePath : isTauriBuild ? './' : '/',
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
