// /sitemap.xml: la lista de páginas para Google, generada desde la BD en cada visita.
// (@astrojs/sitemap solo ve páginas estáticas; las nuestras son bajo demanda.)
// Cada página lleva su versión en el otro idioma (xhtml:link hreflang).
import type { APIRoute } from "astro";
import { getProyectos } from "../lib/proyectos";
import { ruta } from "../i18n";

export const prerender = false;

export const GET: APIRoute = async ({ site }) => {
	const proyectos = await getProyectos(); // solo publicados (sin borradores)
	const paginas = [
		{ path: "/" },
		{ path: "/proyectos" },
		...proyectos.map((p) => ({ path: `/proyectos/${p.slug}`, lastmod: p.actualizadoEn })),
	];

	const url = (path: string) => new URL(path, site).href;
	const entradas = paginas.flatMap(({ path, lastmod }) =>
		(["es", "en"] as const).map(
			(idioma) => `  <url>
    <loc>${url(ruta(idioma, path))}</loc>${lastmod ? `\n    <lastmod>${lastmod.toISOString()}</lastmod>` : ""}
    <xhtml:link rel="alternate" hreflang="es" href="${url(ruta("es", path))}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${url(ruta("en", path))}"/>
  </url>`,
		),
	);

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entradas.join("\n")}
</urlset>
`;
	return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
};
