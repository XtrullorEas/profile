// Tipos globales de Astro para ESTE proyecto.
// Al declararlos aquí, TypeScript sabe qué hay en Astro.locals y en la sesión,
// y te autocompleta / avisa de errores en todo el proyecto.

declare namespace App {
	/** Datos que el middleware deja disponibles para cada petición (Astro.locals) */
	interface Locals {
		usuario?: string;
	}

	/** Datos que guardamos en la sesión (Astro.session.get/set) */
	interface SessionData {
		usuario: string;
	}
}
