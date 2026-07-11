import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: change 'sales-command-center' below to your exact GitHub repo name.
// GitHub Pages serves project sites from https://<user>.github.io/<repo-name>/
// so Vite needs to know that sub-path to build correct asset URLs.
export default defineConfig({
  plugins: [react()],
  base: '/sales-command-center/',
})
