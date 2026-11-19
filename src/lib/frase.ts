// La frase del perfil puede llevar palabras que rotan (Flip Words), entre corchetes:
//   "[Fullstack|automatización|agentes de IA]. Hago que la tecnología trabaje..."
// Sin imports de Astro: se prueba con Node (npm test).

export interface FraseConRotacion {
	antes: string; // texto antes de los corchetes
	palabras: string[]; // las que rotan
	despues: string; // texto después de los corchetes
}

/** "antes [dentro] después" → sus tres partes (el primer par de corchetes), o null. */
export function separarCorchetes(texto: string) {
	const m = texto.match(/^([^[]*)\[([^\]]+)\](.*)$/s);
	return m ? { antes: m[1], dentro: m[2], despues: m[3] } : null;
}

/** Separa la frase en partes. Si no tiene [a|b] con al menos 2 palabras, devuelve null. */
export function separarFrase(frase: string): FraseConRotacion | null {
	const partes = separarCorchetes(frase);
	if (!partes) return null;
	const palabras = partes.dentro.split("|").map((p) => p.trim()).filter(Boolean);
	if (palabras.length < 2) return null;
	return { antes: partes.antes, palabras, despues: partes.despues };
}

/**
 * La bio en párrafos (separados por una línea en blanco). En cada párrafo, el texto
 * [entre corchetes] se marca como "cifrado" (efecto Encrypted Text):
 *   "Uno.\n\nDos [con efecto]." → [[{ texto: "Uno." }], [{ texto: "Dos " }, { texto: "con efecto", cifrado: true }, { texto: "." }]]
 */
export function parrafosDeBio(bio: string) {
	return bio
		.split(/\r?\n\s*\r?\n/)
		.map((p) => p.trim())
		.filter(Boolean)
		.map((parrafo) => {
			const c = separarCorchetes(parrafo);
			if (!c) return [{ texto: parrafo, cifrado: false }];
			return [
				{ texto: c.antes, cifrado: false },
				{ texto: c.dentro, cifrado: true },
				{ texto: c.despues, cifrado: false },
			].filter((t) => t.texto !== "");
		});
}

/**
 * La frase como texto normal, para buscadores y lectores de pantalla:
 * "[Fullstack|automatización|agentes de IA]. Hago..." → "Fullstack, automatización y agentes de IA. Hago..."
 * Intl.ListFormat pone la "y" (o "and" en inglés) donde corresponde.
 */
export function fraseEnTexto(frase: string, idioma: "es" | "en" = "es") {
	const partes = separarFrase(frase);
	if (!partes) return frase;
	const lista = new Intl.ListFormat(idioma, { style: "long", type: "conjunction" }).format(partes.palabras);
	return `${partes.antes}${lista}${partes.despues}`;
}
