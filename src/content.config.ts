// Este archivo define las "colecciones de contenido" del sitio.
// Una colección = un grupo de entradas del mismo tipo (proyectos, posts, etc.)
// con un ESQUEMA que valida que cada entrada tenga los datos correctos.

import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const proyectos = defineCollection({
	// El "loader" dice DE DÓNDE salen las entradas.
	// glob = todos los .md de esa carpeta. El nombre del archivo es el id:
	//   src/content/proyectos/tienda-online.md  →  id "tienda-online"
	loader: glob({ pattern: "**/*.md", base: "./src/content/proyectos" }),

	// El esquema (con Zod) valida el frontmatter de cada .md.
	// Si falta un campo obligatorio o tiene el tipo equivocado, el build falla
	// con un error claro, en vez de romper la página en silencio.
	// `image` es un helper de Astro para validar y optimizar imágenes locales.
	schema: ({ image }) =>
		z.object({
			titulo: z.string(),
			resumen: z.string().max(160), // texto corto para la tarjeta
			fecha: z.coerce.date(), // "2026-03-15" → objeto Date
			tecnologias: z.array(z.string()).default([]),
			portada: image().optional(),
			repo: z.url().optional(),
			demo: z.url().optional(),
			destacado: z.boolean().default(false), // aparece en la portada
			borrador: z.boolean().default(false), // oculto en el sitio
		}),
});

// Exportamos todas las colecciones
export const collections = { proyectos };
