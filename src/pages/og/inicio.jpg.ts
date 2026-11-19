// /og/inicio.jpg: la imagen que muestran LinkedIn, WhatsApp... al compartir la portada.
import type { APIRoute } from "astro";
import { getPerfil } from "../../lib/perfil";
import { ogInicio } from "../../lib/og";

export const prerender = false;

export const GET: APIRoute = async () => {
	const { foto } = await getPerfil();
	return new Response(await ogInicio(foto), {
		headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600" },
	});
};
