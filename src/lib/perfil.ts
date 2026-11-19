// Leer el perfil (fila única) y la experiencia laboral.

import { desc, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { experiencia, perfil, type Perfil } from "./db/schema";

/** Texto inicial. Lo cambias desde /admin/perfil. */
export const PERFIL_INICIAL: Perfil = {
	id: 1,
	nombre: "Elías",
	rol: "Desarrollador web",
	frase: "Construyo la web y también el servidor donde vive.",
	bio: "Trabajo con PHP y MySQL, y últimamente con Astro y Postgres. Todo lo que hago corre en mi propio servidor, con Docker y Dokploy: del primer commit hasta el dominio.",
	foto: null,
	email: null,
	github: "https://github.com/XtrullorEas",
	linkedin: "https://www.linkedin.com/in/moroteelias/",
	whatsapp: null,
	cv: null,
	cvEn: null,
	disponible: true,
	rolEn: "Web developer",
	fraseEn: "I build the web, and the server it lives on.",
	bioEn: null,
	stack: ["HTML", "CSS", "JavaScript", "TypeScript", "Astro", "Tailwind", "PHP", "MySQL", "PostgreSQL", "Docker", "Ubuntu", "Git"],
	hobbies: ["Programación", "Videojuegos", "Música", "Cine", "Deportes"],
	hobbiesEn: ["Programming", "Video games", "Music", "Movies", "Sports"],
};

export async function getPerfil(): Promise<Perfil> {
	const [fila] = await db.select().from(perfil).where(eq(perfil.id, 1));
	return fila ?? PERFIL_INICIAL;
}

/** Trabajos: primero el actual (fin = null), luego del más reciente al más antiguo. */
export async function getExperiencia() {
	return db
		.select()
		.from(experiencia)
		.orderBy(sql`${experiencia.fin} desc nulls first`, desc(experiencia.inicio));
}
