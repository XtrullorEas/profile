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
import { proyectos, perfil, experiencia } from "../lib/db/schema";
import { markdownAHtml } from "../lib/proyectos";
import { guardarPortada, borrarPortada, guardarPdf, TIPOS_PERMITIDOS, TAMANO_MAXIMO, TAMANO_MAXIMO_PDF } from "../lib/uploads";

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

/** Texto → lista sin vacíos. separador "," para tecnologías, salto de línea para logros. */
const lista = (separador: string | RegExp) =>
	// nullish: como hay un .transform(), Astro no "ve" un .optional() y manda null si está vacío
	z
		.string()
		.nullish()
		.transform((texto) =>
			(texto ?? "")
				.split(separador)
				.map((t) => t.trim())
				.filter(Boolean),
		);

/** Texto opcional en inglés: vacío → undefined (y se guarda null: /en usará el español). */
const textoEn = (max?: number) => (max ? z.string().trim().max(max, `Máximo ${max} caracteres`) : z.string().trim()).optional();

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
	tecnologias: lista(","),
	// Un logro por línea del textarea
	logros: lista(/\r?\n/),
	// Inglés (opcional)
	resumenEn: textoEn(160),
	contenidoEn: textoEn(),
	logrosEn: lista(/\r?\n/),
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
	// Galería: imágenes nuevas (input "multiple") y las que marcaste para quitar.
	// Si no se envía nada, Astro da [] (con un array, getAll devuelve todos los valores).
	galeria: z
		.array(z.instanceof(File))
		.refine((fs) => fs.every((f) => f.size === 0 || TIPOS_PERMITIDOS.includes(f.type)), "Alguna imagen tiene un formato no soportado (usa JPG, PNG, WebP, AVIF o GIF)")
		.refine((fs) => fs.every((f) => f.size <= TAMANO_MAXIMO), "Alguna imagen de la galería pesa más de 8 MB"),
	quitarGaleria: z.array(z.string()),
	// El orden de la galería actual (un valor por foto, en el orden elegido con ← →)
	ordenGaleria: z.array(z.string()),
});

type CamposProyecto = z.infer<typeof camposProyecto>;

/** Mismo control que la portada, para el logo de una empresa y tu foto. */
const imagenOpcional = camposProyecto.shape.portada;

// <input type="month"> envía "2024-03" (año-mes, sin día)
const MES = /^\d{4}-(0[1-9]|1[0-2])$/;
const mes = (error: string) => z.string({ error }).regex(MES, error);

const camposExperiencia = z.object({
	empresa: z.string({ error: "La empresa es obligatoria" }).trim().min(1, "La empresa es obligatoria").max(120),
	cargo: z.string({ error: "El cargo es obligatorio" }).trim().min(1, "El cargo es obligatorio").max(120),
	cargoEn: textoEn(120),
	inicio: mes("Elige el mes y año de inicio"),
	fin: mes("Mes no válido").optional(), // vacío = trabajo actual
	logros: lista(/\r?\n/),
	logrosEn: lista(/\r?\n/),
	tecnologias: lista(","),
	logo: imagenOpcional,
	quitarLogo: z.boolean(),
});

/** Convierte lo validado en una fila de experiencia (sin el logo). */
function aFilaExperiencia(d: z.infer<typeof camposExperiencia>) {
	const fila = {
		empresa: d.empresa,
		cargo: d.cargo,
		cargoEn: d.cargoEn || null,
		// Se guarda como el día 1 de ese mes (la columna es "date")
		inicio: new Date(`${d.inicio}-01`),
		fin: d.fin ? new Date(`${d.fin}-01`) : null,
		logros: d.logros,
		logrosEn: d.logrosEn,
		tecnologias: d.tecnologias,
	};
	if (fila.fin && fila.fin < fila.inicio) {
		throw new ActionError({ code: "BAD_REQUEST", message: "La fecha de fin es anterior a la de inicio." });
	}
	return fila;
}

/** Convierte lo validado del formulario en una fila para la tabla. */
function aFila(datos: CamposProyecto) {
	const slug = datos.slug || slugificar(datos.titulo); // si no escribiste slug, se genera del título
	if (!slug) throw new ActionError({ code: "BAD_REQUEST", message: "Escribe un slug (el título no tiene letras ni números)." });
	return {
		titulo: datos.titulo,
		slug,
		resumen: datos.resumen,
		contenido: datos.contenido ?? "",
		resumenEn: datos.resumenEn || null,
		contenidoEn: datos.contenidoEn || null,
		logrosEn: datos.logrosEn,
		fecha: new Date(datos.fecha),
		tecnologias: datos.tecnologias,
		logros: datos.logros,
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

/** Máximo de imágenes en la galería de un proyecto. */
const MAX_GALERIA = 12;

/** Guarda las imágenes nuevas de la galería (las vacías se ignoran). Si una falla, borra las ya guardadas. */
async function procesarGaleria(archivos: File[], slug: string) {
	const guardadas: string[] = [];
	for (const archivo of archivos) {
		if (archivo.size === 0) continue; // input "multiple" sin archivos elegidos
		try {
			guardadas.push(await guardarPortada(archivo, `${slug}-galeria`));
		} catch {
			await Promise.all(guardadas.map(borrarPortada));
			throw new ActionError({ code: "BAD_REQUEST", message: `No se pudo leer "${archivo.name}". ¿Es un archivo de imagen válido?` });
		}
	}
	return guardadas;
}

/** El CV: un PDF opcional (si no eliges archivo, el navegador manda uno vacío). */
const pdfOpcional = z
	.instanceof(File)
	.optional()
	.refine((f) => !f || f.size === 0 || f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"), "El CV tiene que ser un PDF")
	.refine((f) => !f || f.size <= TAMANO_MAXIMO_PDF, "El PDF pesa más de 5 MB");

/** Guarda el PDF (si hay). Si no es un PDF de verdad, error amable en vez de un 500. */
async function procesarPdf(archivo: File | undefined, prefijo: string) {
	if (!archivo || archivo.size === 0) return undefined;
	try {
		return await guardarPdf(archivo, prefijo);
	} catch {
		throw new ActionError({ code: "BAD_REQUEST", message: "El archivo del CV no es un PDF válido." });
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
			if (datos.galeria.filter((f) => f.size > 0).length > MAX_GALERIA) {
				throw new ActionError({ code: "BAD_REQUEST", message: `La galería admite hasta ${MAX_GALERIA} imágenes.` });
			}
			const portada = await procesarPortada(datos.portada, fila.slug);
			const galeria = await procesarGaleria(datos.galeria, fila.slug);

			try {
				// INSERT ... RETURNING id: Postgres nos devuelve el id generado
				const [nuevo] = await db
					.insert(proyectos)
					.values({ ...fila, portada, galeria })
					.returning({ id: proyectos.id });
				return { id: nuevo.id };
			} catch (error) {
				// no dejamos imágenes huérfanas
				await Promise.all([portada, ...galeria].map(borrarPortada));
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

			// Galería: en el orden elegido (solo URLs que de verdad son de este proyecto;
			// si alguna faltara en el orden, va al final), menos las marcadas para quitar,
			// y las nuevas al final.
			const ordenadas = [
				...datos.ordenGaleria.filter((url, i, todas) => actual.galeria.includes(url) && todas.indexOf(url) === i),
				...actual.galeria.filter((url) => !datos.ordenGaleria.includes(url)),
			];
			const conservadas = ordenadas.filter((url) => !datos.quitarGaleria.includes(url));
			if (conservadas.length + datos.galeria.filter((f) => f.size > 0).length > MAX_GALERIA) {
				await borrarPortada(nueva);
				throw new ActionError({ code: "BAD_REQUEST", message: `La galería admite hasta ${MAX_GALERIA} imágenes.` });
			}
			const nuevasGaleria = await procesarGaleria(datos.galeria, fila.slug);
			const galeria = [...conservadas, ...nuevasGaleria];

			try {
				await db
					.update(proyectos)
					.set({ ...fila, portada, galeria })
					.where(eq(proyectos.id, datos.id));
			} catch (error) {
				await Promise.all([nueva, ...nuevasGaleria].map(borrarPortada));
				if (esSlugRepetido(error)) throw errorSlugRepetido();
				throw error;
			}

			// Solo borramos las imágenes viejas cuando el UPDATE ya salió bien
			if (portada !== actual.portada) await borrarPortada(actual.portada);
			await Promise.all(actual.galeria.filter((url) => !galeria.includes(url)).map(borrarPortada));
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
				.returning({ titulo: proyectos.titulo, portada: proyectos.portada, galeria: proyectos.galeria });
			if (!borrado) throw new ActionError({ code: "NOT_FOUND", message: "El proyecto ya no existe." });
			await Promise.all([borrado.portada, ...borrado.galeria].map(borrarPortada));
			return { titulo: borrado.titulo };
		},
	}),

	crearExperiencia: defineAction({
		accept: "form",
		input: camposExperiencia,
		handler: async (datos, context) => {
			await exigirLogin(context);
			const fila = aFilaExperiencia(datos);
			const logo = await procesarPortada(datos.logo, slugificar(fila.empresa) || "empresa");
			const [nueva] = await db.insert(experiencia).values({ ...fila, logo }).returning({ id: experiencia.id });
			return { id: nueva.id };
		},
	}),

	actualizarExperiencia: defineAction({
		accept: "form",
		input: camposExperiencia.extend({ id: z.number().int() }),
		handler: async (datos, context) => {
			await exigirLogin(context);
			const [actual] = await db.select().from(experiencia).where(eq(experiencia.id, datos.id));
			if (!actual) throw new ActionError({ code: "NOT_FOUND", message: "Ese trabajo ya no existe." });

			const fila = aFilaExperiencia(datos);
			const nuevo = await procesarPortada(datos.logo, slugificar(fila.empresa) || "empresa");
			const logo = nuevo ?? (datos.quitarLogo ? null : actual.logo);
			await db.update(experiencia).set({ ...fila, logo }).where(eq(experiencia.id, datos.id));
			if (logo !== actual.logo) await borrarPortada(actual.logo);
			return { id: datos.id };
		},
	}),

	eliminarExperiencia: defineAction({
		accept: "form",
		input: z.object({ id: z.number().int() }),
		handler: async ({ id }, context) => {
			await exigirLogin(context);
			const [borrado] = await db.delete(experiencia).where(eq(experiencia.id, id)).returning({ logo: experiencia.logo });
			if (!borrado) throw new ActionError({ code: "NOT_FOUND", message: "Ese trabajo ya no existe." });
			await borrarPortada(borrado.logo);
			return { ok: true };
		},
	}),

	guardarPerfil: defineAction({
		accept: "form",
		input: z.object({
			nombre: z.string({ error: "El nombre es obligatorio" }).trim().min(1, "El nombre es obligatorio").max(80),
			rol: z.string({ error: "El rol es obligatorio" }).trim().min(1, "El rol es obligatorio").max(80),
			frase: z.string({ error: "La frase es obligatoria" }).trim().min(1, "La frase es obligatoria").max(160, "Máximo 160 caracteres"),
			bio: z.string({ error: "Escribe algo sobre ti" }).trim().min(1, "Escribe algo sobre ti"),
			rolEn: textoEn(80),
			fraseEn: textoEn(160),
			bioEn: textoEn(),
			stack: lista(","),
			hobbies: lista(","),
			hobbiesEn: lista(","),
			email: z.email({ error: "Correo no válido" }).max(160).optional(),
			github: urlOpcional,
			linkedin: urlOpcional,
			// Número de WhatsApp: "+51 915353137" (con código de país, espacios opcionales)
			whatsapp: z
				.string()
				.trim()
				.regex(/^\+?[0-9][0-9\s()-]{6,24}$/, "Número no válido (ej. +51 915353137)")
				.optional(),
			disponible: z.boolean(),
			foto: imagenOpcional,
			quitarFoto: z.boolean(),
			cv: pdfOpcional,
			quitarCv: z.boolean(),
			cvEn: pdfOpcional,
			quitarCvEn: z.boolean(),
		}),
		handler: async ({ foto: archivo, quitarFoto, cv: archivoCv, quitarCv, cvEn: archivoCvEn, quitarCvEn, ...datos }, context) => {
			await exigirLogin(context);
			const [actual] = await db.select().from(perfil).where(eq(perfil.id, 1));
			const nueva = await procesarPortada(archivo, "foto");
			const foto = nueva ?? (quitarFoto ? null : (actual?.foto ?? null));
			// CV: el nuevo > ninguno (si marcaste "quitar") > el que había
			const nuevoCv = await procesarPdf(archivoCv, "cv");
			const nuevoCvEn = await procesarPdf(archivoCvEn, "cv-en").catch(async (e) => {
				await borrarPortada(nuevoCv); // no dejar el CV en español huérfano
				throw e;
			});
			const cv = nuevoCv ?? (quitarCv ? null : (actual?.cv ?? null));
			const cvEn = nuevoCvEn ?? (quitarCvEn ? null : (actual?.cvEn ?? null));
			const fila = {
				...datos,
				email: datos.email ?? null,
				github: datos.github ?? null,
				linkedin: datos.linkedin ?? null,
				whatsapp: datos.whatsapp ?? null,
				rolEn: datos.rolEn || null,
				fraseEn: datos.fraseEn || null,
				bioEn: datos.bioEn || null,
				foto,
				cv,
				cvEn,
			};
			// "upsert": INSERT si no existe la fila 1, UPDATE si ya existe
			await db.insert(perfil).values({ id: 1, ...fila }).onConflictDoUpdate({ target: perfil.id, set: fila });
			// Los archivos viejos se borran solo cuando el guardado ya salió bien
			if (actual?.foto && actual.foto !== foto) await borrarPortada(actual.foto);
			if (actual?.cv && actual.cv !== cv) await borrarPortada(actual.cv);
			if (actual?.cvEn && actual.cvEn !== cvEn) await borrarPortada(actual.cvEn);
			return { ok: true };
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
