import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/ASM/',
  plugins: [
    vue(),
    tailwindcss()
  ],
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});
