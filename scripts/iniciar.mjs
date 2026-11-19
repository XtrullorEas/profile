// Arranque del contenedor de producción:
//   1. aplica las migraciones pendientes de la base de datos (carpeta drizzle/)
//   2. arranca el servidor de Astro
// drizzle-kit es solo de desarrollo (no está en la imagen final); el "migrator"
// de drizzle-orm hace lo mismo y sí está. Usa la misma tabla de control
// (drizzle.__drizzle_migrations), así que nunca aplica dos veces la misma migración.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
	console.error("[iniciar] Falta DATABASE_URL");
	process.exit(1);
}

const cliente = postgres(url, { max: 1, onnotice: () => {} });
try {
	await migrate(drizzle(cliente), { migrationsFolder: "./drizzle" });
	console.log("[iniciar] Base de datos al día");
} catch (error) {
	console.error("[iniciar] No se pudieron aplicar las migraciones:", error);
	process.exit(1); // mejor no arrancar que arrancar con la base a medias
} finally {
	await cliente.end();
}

await import("../dist/server/entry.mjs");
