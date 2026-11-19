// /og/proyectos/the-myoopy-bar.jpg: la vista previa de un proyecto (su captura).
// Sin captura (o si es borrador), la de la portada.
import type { APIRoute } from "astro";
import { getPerfil } from "../../../lib/perfil";
import { getProyectoPorSlug } from "../../../lib/proyectos";
import { ogInicio, ogProyecto } from "../../../lib/og";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
	const proyecto = params.slug ? await getProyectoPorSlug(params.slug) : undefined;
	const imagen = (await ogProyecto(proyecto?.portada)) ?? (await ogInicio((await getPerfil()).foto));
	return new Response(imagen, {
		headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600" },
	});
};
