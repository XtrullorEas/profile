// ISLA: selector de tecnologías con buscador, para los formularios del admin.
//
// El formulario sigue enviando un campo normal: <input type="hidden" name="tecnologias"
// value="HTML, CSS">. Así el servidor (Action + Zod) no cambia nada, y si el JS aún no
// cargó, el formulario se envía igual con lo que ya había.

import { useId, useMemo, useRef, useState } from "preact/hooks";

interface Tecnologia {
	nombre: string;
	icono: string;
}

interface Props {
	name: string; // nombre del campo del formulario
	catalogo: Tecnologia[];
	seleccion: string[]; // lo que ya estaba guardado
}

// ?v=2: si cambia cómo se genera el SVG, subes el número y el navegador no usa su copia vieja
// "devicon:microsoftsqlserver" → /iconos/devicon/microsoftsqlserver.svg
const urlIcono = (icono: string) => `/iconos/${icono.replace(":", "/")}.svg?v=2`;

const normalizar = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function SelectorTecnologias({ name, catalogo, seleccion: inicial }: Props) {
	const [seleccion, setSeleccion] = useState(inicial);
	const [busqueda, setBusqueda] = useState("");
	const [abierto, setAbierto] = useState(false);
	const [activa, setActiva] = useState(0); // opción resaltada con las flechas
	const input = useRef<HTMLInputElement>(null);
	const id = useId(); // ids únicos para conectar input y lista (aria-controls)

	// useMemo: solo recalcula el filtro cuando cambian la búsqueda o la selección
	const opciones = useMemo(() => {
		const q = normalizar(busqueda);
		const disponibles = catalogo.filter((t) => !seleccion.includes(t.nombre) && normalizar(t.nombre).includes(q));
		// Primero las que EMPIEZAN con lo escrito: "as" → Astro antes que JavaScript
		const empieza = (t: Tecnologia) => (normalizar(t.nombre).startsWith(q) ? 0 : 1);
		return disponibles.sort((a, b) => empieza(a) - empieza(b));
	}, [catalogo, seleccion, busqueda]);
	const iconoDe = (nombre: string) => catalogo.find((t) => t.nombre === nombre)?.icono;

	function agregar(nombre: string) {
		setSeleccion([...seleccion, nombre]);
		setBusqueda("");
		setActiva(0);
		input.current?.focus();
	}
	const quitar = (nombre: string) => setSeleccion(seleccion.filter((n) => n !== nombre));

	function teclado(e: KeyboardEvent) {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setAbierto(true);
			setActiva((a) => Math.min(a + 1, opciones.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiva((a) => Math.max(a - 1, 0));
		} else if (e.key === "Enter") {
			e.preventDefault(); // Enter aquí elige una opción, no envía el formulario
			if (abierto && opciones[activa]) agregar(opciones[activa].nombre);
		} else if (e.key === "Escape") {
			setAbierto(false);
		} else if (e.key === "Backspace" && busqueda === "" && seleccion.length > 0) {
			quitar(seleccion[seleccion.length - 1]);
		}
	}

	return (
		<div class="relative mt-1">
			<input type="hidden" name={name} value={seleccion.join(", ")} />

			<div
				class="flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border border-borde bg-superficie px-2 py-1.5 focus-within:border-acento"
				onClick={() => input.current?.focus()}
			>
				{seleccion.map((nombre) => {
					const icono = iconoDe(nombre);
					return (
						<span key={nombre} class="inline-flex items-center gap-1.5 rounded-full bg-white/10 py-0.5 pr-1 pl-1.5 text-sm">
							{icono && <img src={urlIcono(icono)} alt="" class="size-5 rounded-full bg-neutral-100 p-0.5" />}
							{nombre}
							<button
								type="button"
								onClick={() => quitar(nombre)}
								aria-label={`Quitar ${nombre}`}
								class="grid size-5 place-items-center rounded-full text-tenue hover:bg-white/10 hover:text-texto"
							>
								×
							</button>
						</span>
					);
				})}

				<input
					ref={input}
					role="combobox"
					aria-expanded={abierto}
					aria-controls={`${id}-lista`}
					aria-activedescendant={abierto && opciones[activa] ? `${id}-${activa}` : undefined}
					aria-label="Buscar tecnología"
					value={busqueda}
					placeholder={seleccion.length === 0 ? "Busca: php, astro, docker..." : ""}
					onInput={(e) => {
						setBusqueda(e.currentTarget.value);
						setAbierto(true);
						setActiva(0);
					}}
					onFocus={() => setAbierto(true)}
					onBlur={() => setAbierto(false)}
					onKeyDown={teclado}
					class="min-w-32 flex-1 bg-transparent px-1 py-1 text-sm outline-none"
				/>
			</div>

			{abierto && (
				<ul id={`${id}-lista`} role="listbox" class="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-borde bg-superficie p-1 shadow-xl">
					{opciones.length === 0 ? (
						<li class="px-3 py-2 text-sm text-tenue">
							{busqueda ? `"${busqueda}" no está en el catálogo (src/lib/tecnologias.ts)` : "Ya elegiste todas"}
						</li>
					) : (
						opciones.map((t, i) => (
							<li
								key={t.nombre}
								id={`${id}-${i}`}
								role="option"
								aria-selected={i === activa}
								// onMouseDown (no onClick): ocurre ANTES del blur del input, que cerraría la lista
								onMouseDown={(e) => {
									e.preventDefault();
									agregar(t.nombre);
								}}
								onMouseEnter={() => setActiva(i)}
								class={`flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-1.5 text-sm ${i === activa ? "bg-white/10" : ""}`}
							>
								<img src={urlIcono(t.icono)} alt="" class="size-6 rounded-full bg-neutral-100 p-1" />
								{t.nombre}
							</li>
						))
					)}
				</ul>
			)}
			{/* Vista previa: igual que <Tag /> en la página pública (círculos claros sobre negro) */}
			{seleccion.length > 0 && (
				<div class="mt-2 rounded-lg border border-borde bg-black p-3">
					<p class="mb-2 text-xs text-tenue">Así se verá en el sitio:</p>
					<div class="flex flex-wrap gap-2">
						{seleccion.map((nombre) => {
							const icono = iconoDe(nombre);
							return icono ? (
								<span key={nombre} title={nombre} class="grid size-9 place-items-center rounded-full bg-neutral-100">
									<img src={urlIcono(icono)} alt={nombre} class="size-5" />
								</span>
							) : (
								<span key={nombre} class="rounded-full border border-borde px-3 py-1.5 text-sm text-tenue">
									{nombre}
								</span>
							);
						})}
					</div>
				</div>
			)}

		</div>
	);
}
