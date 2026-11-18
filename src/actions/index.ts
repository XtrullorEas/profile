// ACTIONS: funciones del servidor que se llaman desde un formulario o desde JS del navegador.
// Astro se encarga de:
//   1. crear la ruta HTTP (no escribes endpoints a mano)
//   2. convertir el FormData en un objeto y VALIDARLO con Zod
//   3. devolver errores por campo si la validación falla
//   4. darte tipos: en la página, actions.crearProyecto sabe qué recibe y qué devuelve
//
// En PHP sería: un procesar.php que lee $_POST, valida a mano campo por campo,
// guarda en la BD y redirige. Aquí cada paso tiene su lugar.

import { defineAction, ActionError, type ActionAPIContext } from "astro:actions";
import { z } from "astro/zod";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { proyectos } from "../lib/db/schema";
import { markdownAHtml } from "../lib/proyectos";
import { guardarPortada, borrarPortada, TIPOS_PERMITIDOS, TAMANO_MAXIMO } from "../lib/uploads";

// ---------- Seguridad ----------

/**
 * Las Actions también se pueden llamar directamente por HTTP (POST /_actions/...),
 * sin pasar por las páginas /admin que protege el middleware.
 * Por eso cada Action comprueba la sesión por su cuenta ("defensa en profundidad").
 */
async function exigirLogin(context: ActionAPIContext) {
	const usuario = await context.session?.get("usuario");
	if (!usuario) throw new ActionError({ code: "UNAUTHORIZED", message: "Inicia sesión de nuevo." });
}

// ---------- Validación ----------

/** "The MyOOPY Bar!" → "the-myoopy-bar" */
function slugificar(texto: string) {
	return texto
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "") // quita tildes: "café" → "cafe"
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-") // todo lo que no sea letra/número → guion
		.replace(/^-+|-+$/g, "") // sin guiones al principio ni al final
		.slice(0, 120);
}

// Campos de texto opcionales: un input vacío llega como undefined (no como "").
const urlOpcional = z.url({ error: "Debe ser una URL completa (https://...)" }).max(255).optional();

// El esquema describe y valida TODO el formulario de proyecto.
// Si algo no cumple, la Action NO se ejecuta y la página recibe los errores por campo.
const camposProyecto = z.object({
	titulo: z
		.string({ error: "El título es obligatorio" })
		.trim()
		.min(1, "El título es obligatorio")
		.max(120, "Máximo 120 caracteres"),
	slug: z
		.string()
		.trim()
		.max(120, "Máximo 120 caracteres")
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones (ej: mi-proyecto)")
		.optional(),
	resumen: z
		.string({ error: "El resumen es obligatorio" })
		.trim()
		.min(1, "El resumen es obligatorio")
		.max(160, "Máximo 160 caracteres"),
	contenido: z.string().optional(),
	// <input type="date"> envía "2026-11-10"
	fecha: z.iso.date({ error: "La fecha es obligatoria" }),
	// "HTML, CSS, JavaScript" → ["HTML", "CSS", "JavaScript"]
	// nullish (= null o undefined): como hay un .transform(), Astro no "ve" un .optional()
	// y convierte el input vacío en null en vez de undefined.
	tecnologias: z
		.string()
		.nullish()
		.transform((texto) =>
			(texto ?? "")
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean),
		),
	repo: urlOpcional,
	demo: urlOpcional,
	// Checkboxes: Astro los convierte a true (marcado) / false (no marcado)
	destacado: z.boolean(),
	borrador: z.boolean(),
	quitarPortada: z.boolean(),
	// Archivo: si no eliges ninguno, el navegador igual envía un File vacío (size 0)
	portada: z
		.instanceof(File)
		.optional()
		.refine((f) => !f || f.size === 0 || TIPOS_PERMITIDOS.includes(f.type), "Formato no soportado (usa JPG, PNG, WebP, AVIF o GIF)")
		.refine((f) => !f || f.size <= TAMANO_MAXIMO, "La imagen pesa más de 8 MB"),
});

type CamposProyecto = z.infer<typeof camposProyecto>;

/** Convierte lo validado del formulario en una fila para la tabla. */
function aFila(datos: CamposProyecto) {
	const slug = datos.slug || slugificar(datos.titulo); // si no escribiste slug, se genera del título
	if (!slug) throw new ActionError({ code: "BAD_REQUEST", message: "Escribe un slug (el título no tiene letras ni números)." });
	return {
		titulo: datos.titulo,
		slug,
		resumen: datos.resumen,
		contenido: datos.contenido ?? "",
		fecha: new Date(datos.fecha),
		tecnologias: datos.tecnologias,
		repo: datos.repo ?? null,
		demo: datos.demo ?? null,
		destacado: datos.destacado,
		borrador: datos.borrador,
	};
}

/** Procesa la imagen (si hay). Si no es una imagen real, error amable en vez de un 500. */
async function procesarPortada(archivo: File | undefined, slug: string) {
	if (!archivo || archivo.size === 0) return undefined;
	try {
		return await guardarPortada(archivo, slug);
	} catch {
		throw new ActionError({ code: "BAD_REQUEST", message: "No se pudo leer la imagen. ¿Es un archivo de imagen válido?" });
	}
}

/** Postgres responde con el código 23505 cuando se repite un valor UNIQUE (el slug). */
function esSlugRepetido(error: unknown) {
	const e = error as { code?: string; cause?: { code?: string } };
	return (e?.cause?.code ?? e?.code) === "23505";
}

const errorSlugRepetido = () =>
	new ActionError({ code: "CONFLICT", message: "Ya existe otro proyecto con ese slug. Cambia el slug o el título." });

// ---------- Las Actions ----------

export const server = {
	crearProyecto: defineAction({
		accept: "form", // recibe un <form> (FormData), no JSON
		input: camposProyecto,
		// handler: solo se ejecuta si la validación pasó. "datos" ya viene con tipos.
		handler: async (datos, context) => {
			await exigirLogin(context);
			const fila = aFila(datos);
			const portada = await procesarPortada(datos.portada, fila.slug);

			try {
				// INSERT ... RETURNING id: Postgres nos devuelve el id generado
				const [nuevo] = await db
					.insert(proyectos)
					.values({ ...fila, portada })
					.returning({ id: proyectos.id });
				return { id: nuevo.id };
			} catch (error) {
				await borrarPortada(portada); // no dejamos imágenes huérfanas
				if (esSlugRepetido(error)) throw errorSlugRepetido();
				throw error;
			}
		},
	}),

	actualizarProyecto: defineAction({
		accept: "form",
		// .extend(): los mismos campos + el id (input hidden)
		input: camposProyecto.extend({ id: z.number().int() }),
		handler: async (datos, context) => {
			await exigirLogin(context);

			const [actual] = await db.select().from(proyectos).where(eq(proyectos.id, datos.id));
			if (!actual) throw new ActionError({ code: "NOT_FOUND", message: "El proyecto ya no existe." });

			const fila = aFila(datos);
			const nueva = await procesarPortada(datos.portada, fila.slug);

			// ¿Qué portada queda? la nueva > ninguna (si marcaste "quitar") > la que había
			const portada = nueva ?? (datos.quitarPortada ? null : actual.portada);

			try {
				await db
					.update(proyectos)
					.set({ ...fila, portada })
					.where(eq(proyectos.id, datos.id));
			} catch (error) {
				await borrarPortada(nueva);
				if (esSlugRepetido(error)) throw errorSlugRepetido();
				throw error;
			}

			// Solo borramos la imagen vieja cuando el UPDATE ya salió bien
			if (portada !== actual.portada) await borrarPortada(actual.portada);
			return { id: datos.id };
		},
	}),

	eliminarProyecto: defineAction({
		accept: "form",
		input: z.object({ id: z.number().int() }),
		handler: async ({ id }, context) => {
			await exigirLogin(context);
			// DELETE ... RETURNING: nos dice qué borró (para borrar también su imagen)
			const [borrado] = await db
				.delete(proyectos)
				.where(eq(proyectos.id, id))
				.returning({ titulo: proyectos.titulo, portada: proyectos.portada });
			if (!borrado) throw new ActionError({ code: "NOT_FOUND", message: "El proyecto ya no existe." });
			await borrarPortada(borrado.portada);
			return { titulo: borrado.titulo };
		},
	}),

	// Esta se llama desde JavaScript en el navegador (sin "accept": recibe JSON).
	// La usa la pestaña "Vista previa" del editor de Markdown.
	previsualizarMarkdown: defineAction({
		input: z.object({ markdown: z.string().max(200_000) }),
		handler: async ({ markdown }, context) => {
			await exigirLogin(context);
			return { html: markdownAHtml(markdown) };
		},
	}),
};
