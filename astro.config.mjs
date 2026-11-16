// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import node from '@astrojs/node';
import keystatic from '@keystatic/astro';

// https://astro.build/config
export default defineConfig({
  server: {
      // Por defecto Astro solo escucha en 127.0.0.1 (localhost).
      // `host: true` lo hace escuchar en todas las interfaces (0.0.0.0),
      // así se puede abrir desde otra máquina: http://moloeas-srv:4321
      host: true,
      port: 4321,
      // Vite rechaza (403) nombres de host desconocidos para evitar ataques
      // de "DNS rebinding". Permitimos el nombre del servidor:
      allowedHosts: ['moloeas-srv'],
    },

  vite: {
    plugins: [tailwindcss()],
  },

  // react(): Keystatic usa React para su interfaz.
  // keystatic(): crea las rutas /keystatic (el panel) y /api/keystatic (guardar).
  integrations: [react(), keystatic()],

  // El adapter le dice a Astro cómo correr las rutas que necesitan servidor.
  // Las páginas del portfolio SIGUEN siendo HTML estático (rápidas); solo el
  // panel de Keystatic se ejecuta en el servidor Node.
  adapter: node({
    mode: 'standalone',
  }),
});