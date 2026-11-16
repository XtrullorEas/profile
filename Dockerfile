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

# Las variables PUBLIC_* se "hornean" en el build (las usa el navegador),
# por eso deben llegar como build args, no solo como variables de entorno.
ARG PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
ENV PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=$PUBLIC_KEYSTATIC_GITHUB_APP_SLUG

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

EXPOSE 4321

# El adapter Node genera un servidor listo para usar.
# Sirve los HTML estáticos de dist/client y atiende /keystatic.
CMD ["node", "./dist/server/entry.mjs"]
