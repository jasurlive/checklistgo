import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// extra themes are on unless .env says VITE_ENABLE_EXTRA_THEMES=false
process.env.VITE_ENABLE_EXTRA_THEMES ??= 'true'

// https://vite.dev/config/
export default defineConfig({
  // shown on the Settings page
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? 'dev'),
  },
  server: {
    port: 1212,
    open: true,
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
