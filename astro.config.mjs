// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  outDir: "./dist",
  build: {
    assets: "assets", // Define el prefijo de la carpeta de assets en el build
    inlineStylesheets: "always", // Si lo tienes, está bien
  },
  vite: {
    build: {
      // Aumenta el límite para inlinear assets.
      // Los SVGs de iconos suelen ser pequeños. Un valor de 10240 bytes (10KB)
      // debería ser suficiente para inlinear la mayoría de los SVGs.
      // Si tus SVGs son más grandes, ajusta este valor.
      assetsDir: "assets", // Define el prefijo de la carpeta de assets en el build
      assetsInlineLimit: 40960, // 10KB. Puedes probar con un valor más alto si es necesario, ej:  (40KB)
    },
  },
  adapter: vercel(),
});
