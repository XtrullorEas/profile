// Configuración del panel de administración (Keystatic).
// Aquí describimos QUÉ se puede editar y CÓMO se ve el formulario.
// Keystatic lee y escribe los mismos .md de src/content/proyectos,
// así que el resto del sitio (Fase 3) no cambia.

import { config, fields, collection } from "@keystatic/core";

export default config({
	// DÓNDE se guardan los cambios:
	//  - en desarrollo ("local"): directamente en los archivos de este servidor
	//  - en producción ("github"): como commits en tu repo → Dokploy redespliega (Fase 4b)
	storage: import.meta.env.PROD
		? { kind: "github", repo: "XtrullorEas/profile" }
		: { kind: "local" },

	ui: {
		brand: { name: "Portfolio · Admin" },
	},

	collections: {
		proyectos: collection({
			label: "Proyectos",
			// El slug (nombre del archivo) se genera a partir del título:
			// "Tienda Online" → tienda-online.md
			slugField: "titulo",
			// * = el slug. Cada proyecto es src/content/proyectos/<slug>.md
			path: "src/content/proyectos/*",
			// El campo "contenido" es el CUERPO del .md; el resto va al frontmatter
			format: { contentField: "contenido" },
			entryLayout: "content",
			// Columnas que se ven en la lista de proyectos del admin
			columns: ["titulo", "fecha"],

			// Cada campo corresponde a uno del esquema Zod en src/content.config.ts.
			// Los nombres DEBEN coincidir.
			schema: {
				titulo: fields.slug({
					name: { label: "Título", validation: { isRequired: true } },
					slug: { label: "URL", description: "Se usa en /proyectos/<url>" },
				}),
				resumen: fields.text({
					label: "Resumen",
					description: "Texto corto para la tarjeta (máx. 160 caracteres)",
					multiline: true,
					validation: { isRequired: true, length: { max: 160 } },
				}),
				fecha: fields.date({
					label: "Fecha",
					validation: { isRequired: true },
				}),
				tecnologias: fields.array(fields.text({ label: "Tecnología" }), {
					label: "Tecnologías",
					itemLabel: (props) => props.value || "Nueva tecnología",
				}),
				portada: fields.image({
					label: "Portada",
					// Carpeta donde se GUARDA la imagen subida...
					directory: "src/assets/proyectos",
					// ...y cómo se ESCRIBE la ruta en el .md (relativa al .md),
					// para que el helper image() de Astro la encuentre y optimice.
					publicPath: "../../assets/proyectos/",
				}),
				repo: fields.url({ label: "Repositorio (opcional)" }),
				demo: fields.url({ label: "Demo en vivo (opcional)" }),
				destacado: fields.checkbox({
					label: "Destacado",
					description: "Aparece en la portada",
				}),
				borrador: fields.checkbox({
					label: "Borrador",
					description: "Si está marcado, no se publica en el sitio",
				}),
				contenido: fields.markdoc({
					label: "Contenido",
					extension: "md", // guarda .md normales (no .mdoc)
				}),
			},
		}),
	},
});
