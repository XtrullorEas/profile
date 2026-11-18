// Configuración de drizzle-kit, la herramienta de línea de comandos que
// genera y aplica migraciones. Se ejecuta fuera de Astro, por eso lee el .env
// por su cuenta con process.loadEnvFile() (función nativa de Node).

import { defineConfig } from "drizzle-kit";

try {
	process.loadEnvFile(".env");
} catch {
	// En Docker/Dokploy no hay .env: las variables llegan del entorno
}

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/lib/db/schema.ts", // de dónde leer las tablas
	out: "./drizzle", // dónde escribir las migraciones .sql
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
