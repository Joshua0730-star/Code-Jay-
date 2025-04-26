// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  outDir: './dist',
  build: {
    assets: 'assets',
    inlineStylesheets: 'always'
  },
  vite: {
    build: {
      assetsInlineLimit: 0
    }
  },
  server: {
    port: 3000,
    host: true,}
});