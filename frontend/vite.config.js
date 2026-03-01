import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Actualiza la app automáticamente en el celular cuando subes cambios
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'], // Archivos estáticos
      manifest: {
        name: 'Control de Activos ZF',
        short_name: 'ZF Equipos',
        description: 'Sistema de Trazabilidad y Préstamos de Activos ZF',
        theme_color: '#0070BC', // Color de la barra de estado del celular
        background_color: '#ffffff',
        display: 'standalone', // Hace que se vea como app nativa (sin barra de navegador)
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Ayuda a que el icono se adapte a Android/iOS
          }
        ]
      }
    })
  ]
});