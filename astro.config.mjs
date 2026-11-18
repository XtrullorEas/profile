// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  // URL pública del sitio (la usan sitemap, canonical, Astro.site...)
  site: 'https://portfolio.moloeas.com',

  // En Dokploy, Traefik recibe el HTTPS y le pasa la petición al contenedor por HTTP,
  // indicando el dominio/protocolo original en cabeceras X-Forwarded-*.
  // Astro solo confía en esas cabeceras para los dominios listados aquí.
  // Lo necesitaremos para el login del admin: Astro compara el "Origin" de cada
  // formulario enviado con la URL real (protección CSRF), y sin esto creería que es http://.
  security: {
    allowedDomains: [{ hostname: 'portfolio.moloeas.com', protocol: 'https' }],
    // Tamaño máximo de lo que se envía a una Action. Por defecto es 1 MB,
    // poco para subir una portada (las fotos del móvil pesan 3-5 MB).
    actionBodySizeLimit: 10 * 1024 * 1024, // 10 MB
  },

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

  // Variables de entorno con tipo y validación.
  //  context "server" + access "secret" = solo se lee en el servidor, en tiempo de
  //  ejecución, y NUNCA se incluye en el código que llega al navegador.
  env: {
    schema: {
      DATABASE_URL: envField.string({ context: 'server', access: 'secret' }),
      // Credenciales del admin (se crean con: npm run admin:password)
      ADMIN_USER: envField.string({ context: 'server', access: 'secret' }),
      ADMIN_PASSWORD_HASH: envField.string({ context: 'server', access: 'secret', startsWith: 'scrypt:' }),
      // Carpeta donde se guardan las imágenes subidas desde el admin.
      // "default": si no la defines en .env, usa ./uploads (en Dokploy será un volumen).
      UPLOADS_DIR: envField.string({ context: 'server', access: 'secret', default: './uploads' }),
    },
  },

  // Sesiones: el adapter Node las guarda en archivos del servidor.
  // El navegador solo recibe una cookie con un ID aleatorio (httpOnly: JS no puede leerla).
  session: {
    ttl: 60 * 60 * 24 * 7, // la sesión dura 7 días (en segundos)
  },

  // El adapter le dice a Astro cómo correr las rutas que necesitan servidor
  // (el admin, el login, y las páginas que leen de la base de datos).
  adapter: node({
    mode: 'standalone',
  }),
});
