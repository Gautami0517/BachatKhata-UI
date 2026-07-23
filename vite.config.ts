import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * C-Vault — Share Target + Financial Memory vertical slice.
 * injectManifest keeps Android Share Sheet POST handling in our custom SW.
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'C-Vault',
        short_name: 'C-Vault',

        description: 'C-Vault — your financial memory vault',
        theme_color: '#3b3a8c',
        background_color: '#fcf8fe',
        display: 'standalone',
        orientation: 'portrait-primary',
        // Installed app opens auth first; GuestOnly sends signed-in users to Dashboard.
        start_url: '/login',
        scope: '/',
        id: '/',
        share_target: {
          action: '/share',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
            files: [
              {
                name: 'media',
                // Explicit MIME types help Android show C-Vault for Gallery / screenshot shares.
                accept: [
                  'image/*',
                  'image/jpeg',
                  'image/png',
                  'image/webp',
                  'image/gif',
                  'image/jpg',
                  'text/plain',
                ],
              },
            ],
          },
        },
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
})
