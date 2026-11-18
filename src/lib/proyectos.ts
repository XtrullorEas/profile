// Funciones para LEER proyectos desde la base de datos.
// Las páginas usan estas funciones en vez de escribir consultas directamente:
// si mañana cambia la BD, solo se toca este archivo.

import { and, desc, eq } from "drizzle-orm";
import { marked } from "marked";
import { db } from "./db";
import { proyectos } from "./db/schema";

/** Proyectos publicados (sin borradores), del más nuevo al más viejo. */
export async function getProyectos() {
	// Equivale a: SELECT * FROM proyectos WHERE borrador = false ORDER BY fecha DESC
	return db
		.select()
		.from(proyectos)
		.where(eq(proyectos.borrador, false))
		.orderBy(desc(proyectos.fecha));
}

/** Solo los destacados (para la portada). */
export async function getDestacados() {
	return db
		.select()
		.from(proyectos)
		.where(and(eq(proyectos.borrador, false), eq(proyectos.destacado, true)))
		.orderBy(desc(proyectos.fecha));
}

/** Un proyecto publicado por su slug, o undefined si no existe. */
export async function getProyectoPorSlug(slug: string) {
	const [proyecto] = await db
		.select()
		.from(proyectos)
		.where(and(eq(proyectos.slug, slug), eq(proyectos.borrador, false)))
		.limit(1);
	return proyecto;
}

/**
 * Convierte el Markdown guardado en la BD a HTML.
 * Es seguro aquí porque el contenido solo lo escribe el admin (tú).
 * Si algún día los visitantes pudieran escribir, habría que "sanitizar" el HTML.
 */
export function markdownAHtml(markdown: string) {
	return marked.parse(markdown, { async: false });
}

/** Formatea una fecha como "noviembre de 2026" */
export function formatearFecha(fecha: Date) {
	// timeZone UTC: la columna "date" se guarda sin hora (medianoche UTC).
	// Sin esto, en una zona horaria negativa como la de Perú, el 1 de noviembre
	// se mostraría como "octubre".
	return fecha.toLocaleDateString("es", { year: "numeric", month: "long", timeZone: "UTC" });
}
