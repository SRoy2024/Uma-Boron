import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) return 'react'
          if (id.includes('/node_modules/@supabase/') || id.includes('/node_modules/@gotrue/') || id.includes('/node_modules/@realtime/')) return 'supabase'
          if (id.includes('/node_modules/lucide-react/')) return 'icons'
          return undefined
        },
      },
    },
  },
})
