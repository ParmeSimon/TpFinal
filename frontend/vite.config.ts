import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // En DEV : tout /api est transmis au backend Spring local.
      // (En prod, c'est nginx qui fait ce travail — voir nginx.conf.template.)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})