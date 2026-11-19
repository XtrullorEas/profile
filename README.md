# Portfolio · Eas Morote

Portfolio personal en **https://portfolio.moloeas.com**: una landing bilingüe (español/inglés) con tema claro y oscuro, y un **admin propio** para editar el perfil, la experiencia y los proyectos sin tocar código.

Está hecho con **Astro 7** en modo servidor, **PostgreSQL** con Drizzle ORM y **Tailwind 4**, y se despliega con **Dokploy** en un servidor propio.

## Funcionalidades

**Sitio público**
- La landing tiene estas secciones: portada "Port [foto] Folio", sobre mí, experiencia en línea de tiempo, proyectos destacados, stack y contacto.
- Español en `/` e inglés en `/en/`. El contenido en inglés es opcional: si un campo no está traducido, se muestra el español.
- Tema claro u oscuro según el sistema, con un botón para cambiarlo. Se recuerda la elección.
- Componentes adaptados de [nularUI](https://astro.nularui.dev): Floating Navbar, Tracing Beam, Infinite Moving Cards, Container Scroll, Carousel, Flip Words y Encrypted Text.
- Lista de proyectos con filtro por tecnología, y página de cada proyecto con contenido en Markdown y galería.
- CV descargable en PDF, en español e inglés.
- SEO: Open Graph con imágenes generadas al vuelo (1200×630), `sitemap.xml` con alternativas por idioma (hreflang) y `robots.txt`.

**Admin (`/admin`)**
- Login con usuario y contraseña. La contraseña se guarda como hash scrypt y las sesiones viven en el servidor.
- CRUD de proyectos: portada, galería reordenable (hasta 12 imágenes), Markdown con vista previa y modo borrador.
- CRUD de experiencia laboral, con fechas en mes y año.
- Perfil: foto, bio, frase con palabras rotativas, stack, hobbies, CV, redes y WhatsApp.
- Selector de tecnologías con buscador y logos, de un catálogo de unas 85 tecnologías.
- Las imágenes subidas se convierten a WebP (como máximo 1600 px) con sharp.

## Stack

| Parte | Tecnología |
|---|---|
| Framework | Astro 7 (`output` servidor, adapter `@astrojs/node` standalone) |
| Islas interactivas | Preact |
| Estilos | Tailwind CSS 4 (tokens en CSS variables, tema con `data-theme`) |
| Base de datos | PostgreSQL + Drizzle ORM (`postgres.js`) |
| Formularios | Astro Actions + Zod |
| Imágenes | sharp |
| Iconos | Iconify (`logos`, `devicon`, `lucide`), renderizados en el servidor |
| Deploy | Docker multi-stage → Dokploy (Docker Swarm + Traefik) → túnel de Cloudflare |

## Estructura

```text
├── drizzle/                 Migraciones SQL (una sola: 0000_esquema_inicial.sql)
├── public/                  Archivos estáticos (logo, favicon, robots.txt)
├── scripts/
│   ├── crear-admin.ts       npm run admin:password → usuario y hash en .env
│   ├── fix-old-cpu.mjs      Usa el compilador WASM de Astro en CPUs sin AVX2
│   └── iniciar.mjs          Arranque en producción: migra la BD y levanta el servidor
├── src/
│   ├── actions/             Astro Actions del admin (crear, editar y borrar; todas exigen login)
│   ├── components/
│   │   ├── admin/           Formularios y selector de tecnologías
│   │   └── nular/           Componentes de nularUI adaptados
│   ├── i18n/                Textos de la interfaz (es/en) y utilidades de rutas
│   ├── layouts/             BaseLayout (sitio público) y AdminLayout
│   ├── lib/
│   │   ├── db/              Conexión y esquema de Drizzle
│   │   ├── tecnologias.ts   Catálogo de tecnologías e iconos
│   │   ├── uploads.ts       Guardar y borrar imágenes y PDFs
│   │   └── og.ts            Imágenes Open Graph
│   ├── middleware.ts        Protege /admin
│   ├── pages/               Rutas: /, /en, /proyectos, /admin, /uploads, /og, /sitemap.xml
│   ├── styles/              global.css (Tailwind y tokens de tema)
│   └── vistas/              Páginas compartidas entre idiomas (Inicio, Proyectos…)
├── Dockerfile
└── astro.config.mjs
```

Las páginas de `src/pages/` y `src/pages/en/` son finas: solo cargan una **vista** de `src/vistas/`, que recibe el idioma. Así cada página existe una sola vez.

## Desarrollo local

**Requisitos:** Node 24 y un PostgreSQL. En este servidor se usa el contenedor `postgres-shared` en `127.0.0.1:5433`.

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Crea `.env` con la conexión a la base:
   ```bash
   DATABASE_URL=postgres://usuario:contraseña@127.0.0.1:5433/portfolio
   ```
3. Crea las tablas:
   ```bash
   npm run db:migrate
   ```
4. Crea el usuario del admin. Pide usuario y contraseña, y guarda el hash en `.env`:
   ```bash
   npm run admin:password
   ```
5. Arranca:
   ```bash
   npm run dev
   ```
   El sitio queda en http://localhost:4321 y el admin en http://localhost:4321/admin.

### Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | sí | Conexión a PostgreSQL |
| `ADMIN_USER` | sí | Usuario del admin |
| `ADMIN_PASSWORD_HASH` | sí | Hash `scrypt:...` generado por `npm run admin:password` |
| `UPLOADS_DIR` | no | Carpeta de las subidas (`./uploads` por defecto; `/app/data/uploads` en Docker) |

Se validan al arrancar con el esquema `env` de `astro.config.mjs`. Si falta alguna, Astro avisa con un error claro.

### Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm test` | Tests unitarios (`node --test`) de fechas, frases, tecnologías e i18n |
| `npm run db:generate` | Genera una migración a partir de `src/lib/db/schema.ts` |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run admin:password` | Crea o cambia el usuario y la contraseña del admin |

### Cambiar la base de datos

1. Edita `src/lib/db/schema.ts`.
2. Ejecuta `npm run db:generate` y revisa el `.sql` nuevo en `drizzle/`.
3. Ejecuta `npm run db:migrate`.
4. Haz commit de la migración. En producción se aplica sola al arrancar.

## Producción

```text
GitHub (push a main)
   │ webhook → https://deploy.moloeas.com/api/deploy/github
   ▼
Dokploy ── docker build (Dockerfile) ──► contenedor "portfolio"  :4321
                                           ├── /app/data  ← volumen "portfolio-data"
                                           │     ├── uploads/   imágenes y CV
                                           │     └── sessions/  sesiones del admin
                                           └── PostgreSQL "infra-postgres-v0rktz" / BD portfolio_prod
Visitante → Cloudflare (HTTPS) → túnel → Traefik (:80) → contenedor
```

- **Deploy automático:** cada push a `main` dispara un deploy en Dokploy. El túnel de Cloudflare publica **solo** la ruta del webhook (`^/api/deploy/github$`); el panel de Dokploy sigue privado, y GitHub firma cada aviso.
- **Arranque:** `scripts/iniciar.mjs` aplica las migraciones pendientes con el migrator de drizzle-orm (drizzle-kit no está en la imagen) y después levanta el servidor. Si la migración falla, la app no arranca.
- **Datos:** el texto (perfil, experiencia, proyectos) vive en PostgreSQL. Los archivos subidos y las sesiones viven en el volumen `portfolio-data`, que sobrevive a cada deploy.
- **Base de datos compartida:** `infra-postgres-v0rktz` (proyecto `infra` en Dokploy) es una instancia para todos los proyectos. Cada proyecto tiene su propia base y su propio usuario, sin acceso a las demás.
- **HTTPS:** lo pone Cloudflare. En Dokploy, el dominio va con HTTPS desactivado (entrypoint `web`).
- **Variables:** se configuran en Dokploy → app → Environment. Al cambiarlas hay que redesplegar.

### Imagen Docker

- Build multi-stage sobre `node:24-bookworm-slim`. La imagen final solo lleva `dist/`, las dependencias de producción, `drizzle/` y el script de arranque.
- Corre como el usuario `node` (no root).
- Para probarla en local:
  ```bash
  docker build -t portfolio .
  docker run --rm -p 4321:4321 --env-file .env -v portfolio-data:/app/data portfolio
  ```
  Si la base corre en el host, `DATABASE_URL` tiene que apuntar a una dirección que el contenedor pueda alcanzar, no a `127.0.0.1`.

## Notas

- **CPU sin AVX2:** el compilador nativo de Astro falla en CPUs antiguas como el FX-8350. `scripts/fix-old-cpu.mjs` lo reemplaza por la versión WASM. Se ejecuta solo en `postinstall`, `predev` y `prebuild`, también dentro de Docker.
- **Seguridad de subidas:** solo se sirven archivos con nombres generados por la app (`/^[a-z0-9-]+\.(webp|pdf)$/`). Los PDFs se validan por su firma `%PDF-` y las imágenes pasan por sharp.
- **`.gitignore`:** `/uploads/` y `/data/` llevan `/` para ignorar solo las carpetas de la raíz. Sin ella, `src/pages/uploads/` (el endpoint que sirve las imágenes) también quedaría fuera de git.
