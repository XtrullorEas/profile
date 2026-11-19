# Dockerfile para desplegar el portfolio en Dokploy.
# Usa "multi-stage build": una etapa para CONSTRUIR y otra, más liviana, para EJECUTAR.

# ---------- Etapa 1: build ----------
FROM node:24-bookworm-slim AS build
WORKDIR /app

# Primero solo las dependencias: Docker cachea esta capa y no reinstala
# todo cada vez que cambias un .md o un componente.
COPY package.json package-lock.json ./
# El parche de CPU corre en el postinstall (por si Dokploy construye en una CPU sin AVX2)
COPY scripts ./scripts
RUN npm ci

# Ahora el resto del código
COPY . .

RUN npm run build
# Quitamos las dependencias de desarrollo para que la imagen final pese menos
RUN npm prune --omit=dev

# ---------- Etapa 2: runtime ----------
FROM node:24-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# Migraciones + script de arranque (aplica migraciones y luego arranca el servidor)
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/scripts/iniciar.mjs ./scripts/iniciar.mjs

# Datos que deben SOBREVIVIR a cada deploy: imágenes/CV subidos y sesiones del admin.
# En Dokploy, /app/data se monta como volumen.
ENV UPLOADS_DIR=/app/data/uploads
RUN mkdir -p /app/data/uploads /app/data/sessions && chown -R node:node /app/data

# No correr como root dentro del contenedor (la imagen de Node trae el usuario "node")
USER node

EXPOSE 4321

# El adapter Node genera un servidor listo para usar.
# Sirve los HTML estáticos de dist/client y las rutas de servidor (admin, etc.).
CMD ["node", "scripts/iniciar.mjs"]
