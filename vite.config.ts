import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from 'vite-plugin-pwa'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['react.svg', 'icon_64.png', 'icon_256.png', 'icon_512.png', 'icon_32.webp'],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Pocket Khali',
        short_name: 'Pocket Khali',
        description: 'Pocket Khali Description',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icon_64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: '/icon_256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: '/icon_512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
