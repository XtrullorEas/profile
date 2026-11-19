// ENDPOINT que sirve un logo del catálogo como archivo SVG:
//   /iconos/logos/php.svg   /iconos/devicon/microsoftsqlserver.svg
// Lo usa el selector de tecnologías del admin con <img src="...">.
// Los nombres de carpeta/archivo [set]/[icono].svg.ts generan esa URL.
import type { APIRoute } from "astro";
import { svgDe } from "../../../lib/iconos";
import { CATALOGO } from "../../../lib/tecnologias";

export const prerender = false;

export const GET: APIRoute = ({ params }) => {
	const id = `${params.set}:${params.icono}`;
	// Solo iconos del catálogo: nada de servir cualquier cosa que pidan por la URL
	const svg = CATALOGO.some((t) => t.icono === id) ? svgDe(id) : null;
	if (!svg) return new Response("No encontrado", { status: 404 });

	return new Response(svg, {
		headers: {
			"Content-Type": "image/svg+xml",
			"Cache-Control": "public, max-age=86400", // un día en caché
		},
	});
};
