// ENDPOINT que sirve los archivos subidos: GET /uploads/the-myoopy-bar-3f9a1c2b.webp (o un CV .pdf)
//
// ¿Por qué no ponerlas en public/? Porque public/ se copia al hacer el build:
// lo que subas después, en producción, no existiría. Las imágenes viven en una
// carpeta aparte (un volumen en Dokploy) y este endpoint las lee del disco.

import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { carpetaUploads, NOMBRE_VALIDO } from "../../lib/uploads";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
	const archivo = params.archivo ?? "";

	// Seguridad: solo nombres generados por nosotros. Bloquea cosas como
	// /uploads/..%2F.env (intentar leer archivos fuera de la carpeta).
	if (!NOMBRE_VALIDO.test(archivo)) return new Response("No encontrado", { status: 404 });

	try {
		const datos = await readFile(join(carpetaUploads, archivo));
		return new Response(datos, {
			headers: {
				"Content-Type": archivo.endsWith(".pdf") ? "application/pdf" : "image/webp",
				// nosniff: el navegador no "adivina" otro tipo distinto al que decimos
				"X-Content-Type-Options": "nosniff",
				// El nombre cambia si cambias la imagen, así que el navegador
				// puede guardarla en caché "para siempre" (1 año).
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		});
	} catch {
		return new Response("No encontrado", { status: 404 });
	}
};
