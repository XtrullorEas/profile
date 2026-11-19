// Valores con los que se rellena el formulario de proyecto.
// Siempre son strings/booleans, que es lo que entienden los <input>.
//
// Hay tres casos:
//   - proyecto nuevo     → valores vacíos
//   - editar             → valores desde la BD
//   - el envío falló     → lo que el usuario había escrito (¡no se pierde nada!)

import type { Proyecto } from "./db/schema";

export interface ValoresForm {
	titulo: string;
	slug: string;
	resumen: string;
	contenido: string;
	fecha: string; // "2026-11-10", el formato de <input type="date">
	tecnologias: string; // "HTML, CSS, JavaScript"
	logros: string; // uno por línea
	resumenEn: string;
	contenidoEn: string;
	logrosEn: string;
	repo: string;
	demo: string;
	destacado: boolean;
	borrador: boolean;
	portada: string | null; // URL de la portada actual (no viene del formulario)
	galeria: string[]; // URLs de la galería actual (tampoco viene del formulario)
}

export function valoresVacios(): ValoresForm {
	return {
		titulo: "",
		slug: "",
		resumen: "",
		contenido: "",
		fecha: new Date().toISOString().slice(0, 10), // hoy
		tecnologias: "",
		logros: "",
		resumenEn: "",
		contenidoEn: "",
		logrosEn: "",
		repo: "",
		demo: "",
		destacado: false,
		borrador: true, // lo nuevo empieza como borrador: lo publicas cuando esté listo
		portada: null,
		galeria: [],
	};
}

export function valoresDesdeProyecto(p: Proyecto): ValoresForm {
	return {
		titulo: p.titulo,
		slug: p.slug,
		resumen: p.resumen,
		contenido: p.contenido,
		fecha: p.fecha.toISOString().slice(0, 10),
		tecnologias: p.tecnologias.join(", "),
		logros: p.logros.join("\n"),
		resumenEn: p.resumenEn ?? "",
		contenidoEn: p.contenidoEn ?? "",
		logrosEn: p.logrosEn.join("\n"),
		repo: p.repo ?? "",
		demo: p.demo ?? "",
		destacado: p.destacado,
		borrador: p.borrador,
		portada: p.portada,
		galeria: p.galeria,
	};
}

/** Lo que el usuario envió (para volver a mostrarlo si hubo errores). */
export function valoresDesdeFormData(datos: FormData, portadaActual: string | null, galeriaActual: string[] = []): ValoresForm {
	const texto = (campo: string) => String(datos.get(campo) ?? "");
	return {
		titulo: texto("titulo"),
		slug: texto("slug"),
		resumen: texto("resumen"),
		contenido: texto("contenido"),
		fecha: texto("fecha"),
		tecnologias: texto("tecnologias"),
		logros: texto("logros"),
		resumenEn: texto("resumenEn"),
		contenidoEn: texto("contenidoEn"),
		logrosEn: texto("logrosEn"),
		repo: texto("repo"),
		demo: texto("demo"),
		// un checkbox sin marcar directamente no se envía
		destacado: datos.has("destacado"),
		borrador: datos.has("borrador"),
		portada: portadaActual,
		galeria: galeriaActual,
	};
}
