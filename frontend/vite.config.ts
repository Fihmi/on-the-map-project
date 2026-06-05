import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 80 },
    }),
  ],

  build: {
    // Emit a warning when any single chunk exceeds 500 kB (default is 500, made explicit)
    chunkSizeWarningLimit: 500,

    // Enable per-CSS-module splitting so Tailwind + Leaflet CSS aren't all inlined
    // into the critical path — each async chunk loads only the CSS it actually needs.
    cssCodeSplit: true,

    // Inline assets smaller than 4 kB as base64 to eliminate extra round-trips for
    // small icons / images. Larger assets stay as separate files (default: 4096).
    assetsInlineLimit: 4096,

    rollupOptions: {
      output: {
        /**
         * Manual chunk strategy — keeps the initial entry bundle small so the
         * browser can parse and execute it quickly, while heavy libraries load
         * in parallel as separate async chunks (never blocking first paint).
         *
         *  react-vendor   →  react + react-dom + react-router-dom   (~130 kB gz)
         *  motion         →  framer-motion                          (~50 kB gz)
         *  map            →  leaflet + react-leaflet                (~140 kB gz)
         *  particles      →  tsparticles + @tsparticles/*           (~80 kB gz)
         */
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react-dom') ||
              id.includes('react-router-dom') ||
              id.includes('/react/')
            ) {
              return 'react-vendor'
            }
            if (id.includes('framer-motion')) {
              return 'motion'
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'map'
            }
            if (id.includes('tsparticles') || id.includes('@tsparticles')) {
              return 'particles'
            }
          }
        },
      },
    },
  },
})
