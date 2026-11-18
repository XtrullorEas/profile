// ENDPOINT: un archivo .ts en pages/ no devuelve HTML, sino una respuesta "a mano".
// Exportamos una función por cada método HTTP que aceptamos (aquí solo POST).
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ session, redirect }) => {
	// Borra la sesión del servidor y la cookie del navegador
	session?.destroy();
	return redirect("/admin/login");
};
