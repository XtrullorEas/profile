// Imágenes Open Graph: la vista previa que muestran LinkedIn, WhatsApp, X... al pegar
// un enlace. Tamaño estándar 1200×630 y en JPG (LinkedIn no garantiza mostrar WebP).
// Se generan con sharp a partir de tu foto, tu logo y las capturas ya subidas.
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import sharp from "sharp";
import { carpetaUploads, NOMBRE_VALIDO } from "./uploads";
// ?raw: el SVG se incluye como texto en el código del servidor al compilar.
// (En el contenedor de producción la carpeta public/ no existe tal cual: va a dist/client/.)
import logoSvg from "../../public/logo-dark.svg?raw";

export const OG_ANCHO = 1200;
export const OG_ALTO = 630;

/** "/uploads/foto-abc.webp" → contenido del archivo (solo nombres que generamos nosotros) */
async function leerSubida(url: string | null | undefined) {
	if (!url?.startsWith("/uploads/")) return null;
	const nombre = basename(url);
	if (!NOMBRE_VALIDO.test(nombre)) return null;
	return readFile(join(carpetaUploads, nombre)).catch(() => null);
}

/** Portada del sitio: tu logo a la izquierda y tu foto (sin fondo) a la derecha, sobre negro. */
export async function ogInicio(fotoUrl: string | null) {
	// El logo es un SVG vectorial (sin fuentes): se ve igual en cualquier servidor
	const logo = await sharp(Buffer.from(logoSvg), { density: 300 }).resize({ width: 460 }).png().toBuffer();
	const capas: sharp.OverlayOptions[] = [{ input: logo, left: 80, top: Math.round(OG_ALTO / 2 - 65) }];

	const foto = await leerSubida(fotoUrl);
	if (foto) {
		const recorte = await sharp(foto).resize({ height: OG_ALTO, width: 620, fit: "inside" }).toBuffer({ resolveWithObject: true });
		capas.push({ input: recorte.data, left: OG_ANCHO - recorte.info.width - 40, top: OG_ALTO - recorte.info.height });
	}

	return sharp({ create: { width: OG_ANCHO, height: OG_ALTO, channels: 3, background: "#000000" } })
		.composite(capas)
		.jpeg({ quality: 85 })
		.toBuffer();
}

/** Un proyecto: su captura recortada a 1200×630 (desde arriba, donde suele estar lo importante). */
export async function ogProyecto(portadaUrl: string | null) {
	const portada = await leerSubida(portadaUrl);
	if (!portada) return null;
	return sharp(portada).resize(OG_ANCHO, OG_ALTO, { fit: "cover", position: "top" }).jpeg({ quality: 85 }).toBuffer();
}
