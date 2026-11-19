// Los sets de iconos de Iconify que usa el sitio, en un solo lugar.
//   logos   → "SVG Logos" (CC0): logos a color de tecnologías y marcas
//   devicon → "Devicon" (MIT): tecnologías que no están en logos (ej. SQL Server)
//   lucide  → iconos de interfaz (correo, flechas, GitHub en un color...)
// Para sumar otro set: npm install @iconify-json/<set> y agrégalo a SETS.
import { getIconData, iconToSVG, iconToHTML, replaceIDs } from "@iconify/utils";
import logos from "@iconify-json/logos/icons.json";
import devicon from "@iconify-json/devicon/icons.json";
import lucide from "@iconify-json/lucide/icons.json";

const SETS = { logos, devicon, lucide };

export type IdIcono = `${keyof typeof SETS}:${string}`;

/**
 * "logos:php" → '<svg ...>...</svg>', o null si el icono no existe.
 * colorDelTexto: pinta los rellenos fijos con el color del texto (currentColor), para que
 * un logo monocromo (ej. logos:whatsapp-monochrome-icon) siga al tema como los de Lucide.
 */
export function svgDe(id: string, atributos: Record<string, string> = {}, colorDelTexto = false) {
	const [set, nombre] = id.split(":");
	const coleccion = SETS[set as keyof typeof SETS];
	const datos = coleccion && nombre ? getIconData(coleccion, nombre) : null;
	if (!datos) return null;
	const { attributes, body: original } = iconToSVG(datos);
	const body = colorDelTexto ? original.replace(/fill="#[0-9a-fA-F]{3,8}"/g, 'fill="currentColor"') : original;
	// replaceIDs: si hay dos iconos iguales en la página, sus degradados no chocan.
	// iconToHTML ya pone xmlns: no lo repitas (un atributo doble rompe el SVG en <img>).
	return iconToHTML(replaceIDs(body), { ...attributes, ...atributos });
}
