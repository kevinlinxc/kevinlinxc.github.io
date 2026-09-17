import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';

// Static export: Wrangler serves dist/client without a server adapter.
export default defineConfig({
  css: { postcss: { plugins: [tailwindcss()] } },
  server: { host: '127.0.0.1', watch: { usePolling: true } },
  plugins: [vinext()],
});
