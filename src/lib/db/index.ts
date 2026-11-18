// Conexión a la base de datos.
// ⚠️ Este módulo solo debe importarse en código de SERVIDOR (frontmatter de páginas
// con prerender = false, endpoints, Actions, middleware). Nunca en un <script> del navegador.

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
// astro:env/server valida y expone las variables definidas en astro.config.mjs (env.schema).
// Si DATABASE_URL falta, Astro da un error claro al arrancar en vez de fallar más tarde.
import { DATABASE_URL } from "astro:env/server";
import * as schema from "./schema";

// postgres.js mantiene un "pool" de conexiones reutilizables.
// max: 5 es más que suficiente para un portfolio.
const client = postgres(DATABASE_URL, { max: 5 });

// Pasar el schema habilita la API de consultas relacional: db.query.proyectos.findMany()
export const db = drizzle(client, { schema });
