// Fechas de la experiencia laboral. Sin imports de Astro: se pueden probar con Node (npm test).

type Idioma = "es" | "en";

const PALABRAS = {
	es: { actual: "actualidad", anio: "año", anios: "años", mes: "mes", meses: "meses", y: " y " },
	en: { actual: "present", anio: "year", anios: "years", mes: "month", meses: "months", y: " and " },
};

/** "mar 2023 – jun 2025", "feb 2025 – actualidad" (en inglés: "Feb 2025 – present") */
export function periodo(inicio: Date, fin: Date | null, idioma: Idioma = "es") {
	// timeZone UTC: la fecha se guarda como el día 1 a medianoche UTC; sin esto,
	// en una zona horaria negativa (Perú) marzo se mostraría como febrero
	const mes = (d: Date) => d.toLocaleDateString(idioma, { month: "short", year: "numeric", timeZone: "UTC" });
	if (!fin) return `${mes(inicio)} – ${PALABRAS[idioma].actual}`;
	return mes(inicio) === mes(fin) ? mes(inicio) : `${mes(inicio)} – ${mes(fin)}`;
}

/** "1 año y 3 meses", "5 meses" (hasta hoy si sigue en curso) */
export function duracion(inicio: Date, fin: Date | null, idioma: Idioma = "es") {
	const p = PALABRAS[idioma];
	const hasta = fin ?? new Date();
	const meses = Math.max(1, (hasta.getUTCFullYear() - inicio.getUTCFullYear()) * 12 + hasta.getUTCMonth() - inicio.getUTCMonth());
	const a = Math.floor(meses / 12);
	const m = meses % 12;
	const partes = [a && `${a} ${a === 1 ? p.anio : p.anios}`, m && `${m} ${m === 1 ? p.mes : p.meses}`].filter(Boolean);
	return partes.join(p.y);
}
