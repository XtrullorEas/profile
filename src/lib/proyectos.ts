import { getCollection } from "astro:content";

/**
 * Devuelve los proyectos publicados (sin borradores), del más nuevo al más viejo.
 * La centralizamos aquí para no repetir el filtro/orden en cada página.
 */
export async function getProyectos() {
	// El segundo argumento es un filtro: se queda con los que devuelvan true
	const proyectos = await getCollection("proyectos", ({ data }) => !data.borrador);

	return proyectos.sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime());
}

/** Formatea una fecha como "septiembre de 2025" */
export function formatearFecha(fecha: Date) {
	return fecha.toLocaleDateString("es", { year: "numeric", month: "long" });
}
