// Catálogo de tecnologías: el nombre que se guarda y se muestra, su icono
// ("set:nombre" de Iconify, ver src/lib/iconos.ts) y otras formas de escribirlo.
// Para agregar una: búscala en https://icon-sets.iconify.design/ (primero en "logos",
// si no está, en "devicon") y súmala aquí con su id, ej. "devicon:microsoftsqlserver".
import type { IdIcono } from "./iconos";

export const CATALOGO = [
	// ─── Web base ────────────────────────────────────────────────
	{ nombre: "HTML", icono: "logos:html-5", alias: ["html5"] },
	{ nombre: "CSS", icono: "logos:css-3", alias: ["css3"] },

	// ─── Lenguajes ───────────────────────────────────────────────
	{ nombre: "JavaScript", icono: "logos:javascript", alias: ["js"] },
	{ nombre: "TypeScript", icono: "logos:typescript-icon", alias: ["ts"] },
	{ nombre: "Python", icono: "logos:python" },
	{ nombre: "PHP", icono: "logos:php" },
	{ nombre: "Java", icono: "logos:java" },
	{ nombre: "C#", icono: "logos:c-sharp", alias: ["csharp"] },
	{ nombre: "C++", icono: "logos:c-plusplus", alias: ["cpp"] },
	{ nombre: "Go", icono: "logos:go", alias: ["golang"] },
	{ nombre: "Rust", icono: "logos:rust" },
	{ nombre: "Kotlin", icono: "logos:kotlin-icon" },
	{ nombre: "Swift", icono: "logos:swift" },
	{ nombre: "Dart", icono: "logos:dart" },
	{ nombre: "Bash", icono: "logos:bash-icon", alias: ["shell"] },
	// Verificar: puede no estar en "logos"
	{ nombre: "PowerShell", icono: "devicon:powershell" },

	// ─── Frontend: frameworks y librerías ────────────────────────
	{ nombre: "React", icono: "logos:react" },
	{ nombre: "Preact", icono: "logos:preact" },
	{ nombre: "Vue", icono: "logos:vue" },
	{ nombre: "Angular", icono: "logos:angular-icon" },
	{ nombre: "Svelte", icono: "logos:svelte-icon", alias: ["sveltejs"] },
	{ nombre: "jQuery", icono: "logos:jquery" },

	// ─── Meta-frameworks / sitios ────────────────────────────────
	{ nombre: "Astro", icono: "logos:astro-icon" },
	{ nombre: "Next.js", icono: "logos:nextjs-icon" },
	{ nombre: "Nuxt", icono: "logos:nuxt-icon", alias: ["nuxtjs"] },
	{ nombre: "WordPress", icono: "logos:wordpress-icon" },

	// ─── Estilos ─────────────────────────────────────────────────
	{ nombre: "Tailwind", icono: "logos:tailwindcss-icon", alias: ["tailwindcss"] },
	{ nombre: "Bootstrap", icono: "logos:bootstrap" },
	{ nombre: "Sass", icono: "logos:sass" },

	// ─── Backend: frameworks ─────────────────────────────────────
	{ nombre: "Node.js", icono: "logos:nodejs-icon", alias: ["node"] },
	{ nombre: "Express", icono: "logos:express" },
	{ nombre: "NestJS", icono: "logos:nestjs" },
	// Verificar: puede no estar en "logos"
	{ nombre: "Hono", icono: "logos:hono" },
	{ nombre: "Laravel", icono: "logos:laravel" },
	{ nombre: "Django", icono: "logos:django-icon" },
	{ nombre: "FastAPI", icono: "logos:fastapi-icon" },
	{ nombre: "Flask", icono: "logos:flask" },
	{ nombre: "Spring", icono: "logos:spring-icon", alias: ["springboot"] },
	{ nombre: ".NET", icono: "logos:dotnet", alias: ["dotnet", "aspnet", "aspnetcore"] },
	{ nombre: "GraphQL", icono: "logos:graphql" },

	// ─── Móvil ───────────────────────────────────────────────────
	{ nombre: "React Native", icono: "logos:react", alias: ["rn"] },
	{ nombre: "Expo", icono: "logos:expo-icon" },
	{ nombre: "Flutter", icono: "logos:flutter" },

	// ─── Runtimes, build y paquetes ──────────────────────────────
	{ nombre: "Bun", icono: "logos:bun" },
	{ nombre: "Deno", icono: "logos:deno" },
	{ nombre: "Vite", icono: "logos:vitejs" },
	{ nombre: "pnpm", icono: "logos:pnpm" },
	{ nombre: "Composer", icono: "logos:composer" },

	// ─── Bases de datos y ORMs ───────────────────────────────────
	{ nombre: "PostgreSQL", icono: "logos:postgresql", alias: ["postgres"] },
	{ nombre: "MySQL", icono: "logos:mysql" },
	// No está en "SVG Logos": viene de Devicon
	{ nombre: "Microsoft SQL Server", icono: "devicon:microsoftsqlserver", alias: ["mssql", "sqlserver"] },
	{ nombre: "SQLite", icono: "logos:sqlite" },
	{ nombre: "MongoDB", icono: "logos:mongodb-icon" },
	{ nombre: "Redis", icono: "logos:redis" },
	{ nombre: "Drizzle", icono: "logos:drizzle-orm-icon" },
	{ nombre: "Prisma", icono: "logos:prisma" },

	// ─── Testing ─────────────────────────────────────────────────
	{ nombre: "Jest", icono: "logos:jest" },
	{ nombre: "Vitest", icono: "logos:vitest" },
	{ nombre: "Playwright", icono: "logos:playwright" },

	// ─── DevOps, servidores y sistemas ───────────────────────────
	{ nombre: "Docker", icono: "logos:docker-icon" },
	{ nombre: "Kubernetes", icono: "logos:kubernetes", alias: ["k8s"] },
	{ nombre: "Terraform", icono: "logos:terraform-icon" },
	{ nombre: "Nginx", icono: "logos:nginx" },
	{ nombre: "Linux", icono: "logos:linux-tux" },
	{ nombre: "Ubuntu", icono: "logos:ubuntu" },

	// ─── Control de versiones y CI/CD ────────────────────────────
	{ nombre: "Git", icono: "logos:git-icon" },
	{ nombre: "GitHub", icono: "logos:github-icon" },
	{ nombre: "GitHub Actions", icono: "logos:github-actions" },
	{ nombre: "GitLab", icono: "logos:gitlab" },

	// ─── Nube y hosting ──────────────────────────────────────────
	{ nombre: "AWS", icono: "logos:aws" },
	{ nombre: "Azure", icono: "logos:microsoft-azure" },
	{ nombre: "Google Cloud", icono: "logos:google-cloud", alias: ["gcp"] },
	{ nombre: "Cloudflare", icono: "logos:cloudflare" },
	{ nombre: "Vercel", icono: "logos:vercel-icon" },
	{ nombre: "Supabase", icono: "logos:supabase-icon" },
	{ nombre: "Firebase", icono: "logos:firebase" },

	// ─── Editores y herramientas ─────────────────────────────────
	{ nombre: "VS Code", icono: "logos:visual-studio-code", alias: ["vscode"] },
	{ nombre: "IntelliJ IDEA", icono: "logos:intellij-idea", alias: ["intellij"] },
	{ nombre: "Postman", icono: "logos:postman-icon" },
	{ nombre: "Figma", icono: "logos:figma" },
	{ nombre: "Jira", icono: "logos:jira" },

	// ─── IA y automatización ─────────────────────────────────────
	{ nombre: "OpenAI", icono: "logos:openai-icon", alias: ["chatgpt"] },
	// Verificar: puede no estar en "logos"
	{ nombre: "Claude", icono: "logos:claude-icon", alias: ["claudecode"] },
	// Verificar: puede no estar en "logos"
	{ nombre: "n8n", icono: "logos:n8n" },
] as const satisfies readonly { nombre: string; icono: IdIcono; alias?: readonly string[] }[];

/** "Node.js" → "nodejs", "Tailwind CSS" → "tailwindcss" */
const clave = (texto: string) => texto.toLowerCase().replace(/[\s.\-]/g, "");

/** La entrada del catálogo para un nombre o alias, o undefined. */
export function buscarTecnologia(texto: string) {
	const k = clave(texto);
	return CATALOGO.find((t) => clave(t.nombre) === k || ("alias" in t && t.alias.some((a) => clave(a) === k)) || clave(t.nombre) === k.replace(/css$/, ""));
}

/** "Tailwind CSS" → "logos:tailwindcss-icon" (o undefined si no está en el catálogo) */
export function iconoDe(tecnologia: string): IdIcono | undefined {
	return buscarTecnologia(tecnologia)?.icono;
}

/** "html, JS ,Tailwind CSS" → ["HTML", "JavaScript", "Tailwind"]. Lo que no está en el catálogo se conserva tal cual. */
export function aNombresDelCatalogo(texto: string) {
	return texto
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean)
		.map((t) => buscarTecnologia(t)?.nombre ?? t);
}

/** Lo que necesita el selector del admin: nombre + icono. */
export const catalogoParaSelector = CATALOGO.map(({ nombre, icono }) => ({ nombre, icono }));
