import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // This line will make Vite open the browser automatically
    port: 5173, // Optional: You can specify a port, or remove for default
  }
})