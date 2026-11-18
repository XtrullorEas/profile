// Guardar y borrar las imágenes de portada.
//
// Cuando subes una imagen, sharp la OPTIMIZA una sola vez, al subirla:
//   - la gira según los datos EXIF (las fotos del móvil vienen "acostadas")
//   - la reduce a 1600 px de ancho como máximo
//   - la convierte a WebP (pesa mucho menos que JPG/PNG)
// Así el sitio público solo sirve archivos ya livianos, sin procesar nada por visita.

import { randomBytes } from "node:crypto";
import { mkdir, unlink } from "node:fs/promises";
import { join, resolve, basename } from "node:path";
import sharp from "sharp";
import { UPLOADS_DIR } from "astro:env/server";

/** Carpeta absoluta donde viven las imágenes (./uploads por defecto) */
export const carpetaUploads = resolve(UPLOADS_DIR);

/** URL pública con la que se sirven: /uploads/nombre.webp */
const PREFIJO_URL = "/uploads/";

/** Solo aceptamos nombres que generamos nosotros: letras, números, guiones y .webp */
export const NOMBRE_VALIDO = /^[a-z0-9-]+\.webp$/;

export const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
export const TAMANO_MAXIMO = 8 * 1024 * 1024; // 8 MB

/**
 * Optimiza la imagen y la guarda en disco.
 * Devuelve la URL pública que se guarda en la columna "portada".
 * Lanza un error si el archivo no es una imagen válida.
 */
export async function guardarPortada(archivo: File, slug: string) {
	await mkdir(carpetaUploads, { recursive: true });

	// Nombre único: si cambias la portada, la URL cambia y el navegador no
	// muestra la vieja desde su caché. Ej: the-myoopy-bar-3f9a1c2b.webp
	const nombre = `${slug}-${randomBytes(4).toString("hex")}.webp`;

	const buffer = Buffer.from(await archivo.arrayBuffer());
	await sharp(buffer)
		.rotate() // orientación correcta según EXIF
		.resize({ width: 1600, withoutEnlargement: true }) // no agranda las pequeñas
		.webp({ quality: 80 })
		.toFile(join(carpetaUploads, nombre));

	return PREFIJO_URL + nombre;
}

/** Borra del disco la imagen de una URL /uploads/... (si existe). */
export async function borrarPortada(url: string | null | undefined) {
	if (!url?.startsWith(PREFIJO_URL)) return;
	// basename() descarta cualquier "../": nunca borramos fuera de la carpeta
	const nombre = basename(url);
	if (!NOMBRE_VALIDO.test(nombre)) return;
	await unlink(join(carpetaUploads, nombre)).catch(() => {}); // si ya no existe, da igual
}
