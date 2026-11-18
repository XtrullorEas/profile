// MIDDLEWARE: código que se ejecuta ANTES de cada petición, para todas las páginas.
// Es el lugar ideal para la seguridad: una sola puerta en vez de repetir
// "¿estás logueado?" al principio de cada página del admin.
//
//   petición → onRequest() → [¿puede pasar?] → next() → página → respuesta

import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;
	const esAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

	// Las páginas públicas pasan directo (sin tocar la sesión)
	if (!esAdmin) return next();

	// ¿Hay alguien logueado? La sesión vive en el servidor; el navegador solo tiene el ID.
	const usuario = await context.session?.get("usuario");
	// locals: datos compartidos con la página durante ESTA petición (Astro.locals.usuario)
	context.locals.usuario = usuario;

	if (pathname === "/admin/login") {
		// Ya logueado → no tiene sentido ver el login
		if (usuario) return context.redirect("/admin");
		return next();
	}

	// Cualquier otra ruta /admin/... exige sesión
	if (!usuario) return context.redirect("/admin/login");

	const respuesta = await next();
	// Que el navegador/proxies no guarden en caché páginas privadas,
	// y que los buscadores no las indexen.
	respuesta.headers.set("Cache-Control", "no-store");
	respuesta.headers.set("X-Robots-Tag", "noindex");
	return respuesta;
});
