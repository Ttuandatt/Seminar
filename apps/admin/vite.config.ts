import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  cacheDir: 'node_modules/.vite-admin-cache',
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    clearMocks: true,
  },
})
