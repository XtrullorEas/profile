// Idiomas del sitio. El español vive en "/" y el inglés en "/en/" (ver i18n en astro.config.mjs).
// Aquí está el texto de la INTERFAZ. Tu contenido (frase, bio, logros...) sale de la BD,
// con su versión en inglés opcional (si falta, se usa el español: ver traducido()).

export const IDIOMAS = ["es", "en"] as const;
export type Idioma = (typeof IDIOMAS)[number];

const textos = {
	es: {
		"menu.sobreMi": "Sobre mí",
		"menu.experiencia": "Experiencia",
		"menu.proyectos": "Proyectos",
		"menu.contacto": "Contacto",
		"menu.inicio": "ir al inicio",
		"menu.tema": "Cambiar a tema claro u oscuro",
		"menu.idioma": "English",
		"inicio.titulo": "Portfolio",
		"inicio.sobreMi": "Sobre mí.",
		"inicio.disponible": "Disponible para trabajar",
		"inicio.hobbies": "Fuera del código",
		"inicio.experiencia": "Experiencia.",
		"inicio.proyectos": "Proyectos.",
		"inicio.verTodos": "Ver todos",
		"inicio.stack": "Stack.",
		"inicio.hablamos": "¿Hablamos?",
		"inicio.buscando": "Estoy buscando nuevos proyectos y oportunidades. Escríbeme por donde te quede más cómodo.",
		"inicio.escribeme": "Escríbeme por donde te quede más cómodo.",
		"inicio.foto": "Foto de",
		"proyectos.titulo": "Proyectos.",
		"proyectos.descripcion": "Proyectos en los que he trabajado.",
		"proyectos.vacio": "Todavía no hay proyectos publicados. ¡Pronto habrá novedades!",
		"proyectos.uno": "proyecto en el que he trabajado.",
		"proyectos.varios": "proyectos en los que he trabajado.",
		"proyectos.todas": "Todas",
		"proyectos.de": "de",
		"proyectos.con": "con",
		"proyecto.ver": "Ver proyecto",
		"proyecto.captura": "Captura de",
		"proyecto.volver": "Todos los proyectos",
		"proyecto.enVivo": "Ver en vivo",
		"proyecto.codigo": "Código",
		"proyecto.galeria": "Galería.",
		"proyecto.imagen": "Imagen",
		"carrusel.region": "Galería de imágenes",
		"carrusel.anterior": "Imagen anterior",
		"carrusel.siguiente": "Imagen siguiente",
		"404.titulo": "Página no encontrada",
		"404.texto": "Esta página no existe",
		"404.volver": "Ver los proyectos",
		"pie.hecho": "Hecho con Astro y alojado en mi propio servidor.",
	},
	en: {
		"menu.sobreMi": "About",
		"menu.experiencia": "Experience",
		"menu.proyectos": "Projects",
		"menu.contacto": "Contact",
		"menu.inicio": "go to home",
		"menu.tema": "Switch between light and dark theme",
		"menu.idioma": "Español",
		"inicio.titulo": "Portfolio",
		"inicio.sobreMi": "About me.",
		"inicio.disponible": "Open to work",
		"inicio.hobbies": "Away from the keyboard",
		"inicio.experiencia": "Experience.",
		"inicio.proyectos": "Projects.",
		"inicio.verTodos": "See all",
		"inicio.stack": "Stack.",
		"inicio.hablamos": "Let's talk.",
		"inicio.buscando": "I'm looking for new projects and opportunities. Reach out wherever is easiest for you.",
		"inicio.escribeme": "Reach out wherever is easiest for you.",
		"inicio.foto": "Photo of",
		"proyectos.titulo": "Projects.",
		"proyectos.descripcion": "Projects I've worked on.",
		"proyectos.vacio": "No projects published yet. Stay tuned!",
		"proyectos.uno": "project I've worked on.",
		"proyectos.varios": "projects I've worked on.",
		"proyectos.todas": "All",
		"proyectos.de": "of",
		"proyectos.con": "with",
		"proyecto.ver": "View project",
		"proyecto.captura": "Screenshot of",
		"proyecto.volver": "All projects",
		"proyecto.enVivo": "View live",
		"proyecto.codigo": "Code",
		"proyecto.galeria": "Gallery.",
		"proyecto.imagen": "Image",
		"carrusel.region": "Image gallery",
		"carrusel.anterior": "Previous image",
		"carrusel.siguiente": "Next image",
		"404.titulo": "Page not found",
		"404.texto": "This page doesn't exist",
		"404.volver": "See the projects",
		"pie.hecho": "Built with Astro and hosted on my own server.",
	},
} as const satisfies Record<Idioma, Record<string, string>>;

export type Clave = keyof (typeof textos)["es"];

/** const t = traductor("en");  t("menu.proyectos") → "Projects" */
export function traductor(idioma: Idioma) {
	return (clave: Clave) => textos[idioma][clave];
}

/** Astro.currentLocale ("es" | "en" | undefined) → Idioma */
export function idiomaDe(locale: string | undefined): Idioma {
	return locale === "en" ? "en" : "es";
}

/** Ruta de la app en el idioma dado: ("en", "/proyectos") → "/en/proyectos" */
export function ruta(idioma: Idioma, path: string) {
	if (idioma === "es") return path;
	return path === "/" ? "/en/" : `/en${path}`;
}

/** La misma página en el otro idioma: "/en/proyectos/x" ↔ "/proyectos/x" */
export function rutaEnOtroIdioma(pathname: string, idioma: Idioma) {
	if (idioma === "en") return pathname.replace(/^\/en(\/|$)/, "/") || "/";
	return ruta("en", pathname);
}

/** Contenido de la BD: el inglés si existe y estamos en /en, si no el español. */
export function traducido<T extends string | readonly string[]>(idioma: Idioma, es: T, en: T | null | undefined): T {
	if (idioma !== "en" || en == null) return es;
	return (typeof en === "string" ? en.trim() !== "" : en.length > 0) ? en : es;
}
