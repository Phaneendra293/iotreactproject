import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to Azure Functions local host during development
      '/api': {
        target: 'http://localhost:7071',
        changeOrigin: true,
        secure: false,
        // keep the /api prefix so Functions routing works as expected
        rewrite: (path) => path,
      },
    },
  },
})
