import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: process.env.VERCEL ? '/' : '/ASM/',
  plugins: [
    vue(),
    tailwindcss()
  ],
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-vue': ['vue', 'vue-router', 'pinia']
        }
      }
    }
  }
});
