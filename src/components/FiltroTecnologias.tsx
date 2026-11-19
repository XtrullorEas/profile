// ISLA de Preact: un componente con estado que vive en el navegador.
// El resto de /proyectos es HTML estático; solo este trozo trae JavaScript.
//
// Las tarjetas NO las dibuja Preact: las genera Astro en el servidor (con su brillo
// y sus View Transitions). La isla solo decide cuáles se ven, usando el atributo
// data-tecnologias que la página le pone a cada una.

import { useEffect, useState } from "preact/hooks";

interface Props {
	tecnologias: string[]; // Astro serializa las props y se las pasa al navegador
	total: number;
	/** Textos en el idioma de la página: { todas: "Todas", de: "de", con: "con" } */
	textos: { todas: string; de: string; con: string };
}

export default function FiltroTecnologias({ tecnologias, total, textos }: Props) {
	// Estado: la tecnología elegida (null = todas). Al cambiarla, Preact vuelve a dibujar.
	const [activa, setActiva] = useState<string | null>(null);
	const [visibles, setVisibles] = useState(total);

	// useEffect: código que corre DESPUÉS de dibujar, cada vez que cambia "activa".
	// Aquí mostramos u ocultamos las tarjetas.
	useEffect(() => {
		let cuenta = 0;
		document.querySelectorAll<HTMLElement>("[data-tecnologias]").forEach((tarjeta) => {
			const suyas: string[] = JSON.parse(tarjeta.dataset.tecnologias!);
			const seVe = activa === null || suyas.includes(activa);
			tarjeta.hidden = !seVe;
			if (seVe) cuenta++;
		});
		setVisibles(cuenta);
	}, [activa]);

	const boton = (texto: string, valor: string | null) => (
		<button
			type="button"
			// aria-pressed: un lector de pantalla anuncia si el botón está activo
			aria-pressed={activa === valor}
			onClick={() => setActiva(valor)}
			class={`rounded-full border px-3 py-1 text-sm transition-colors ${
				activa === valor
					? "border-texto bg-texto text-fondo"
					: "border-borde bg-superficie text-tenue hover:text-texto"
			}`}
		>
			{texto}
		</button>
	);

	return (
		<div class="mt-8">
			<div class="flex flex-wrap gap-2">
				{boton(textos.todas, null)}
				{tecnologias.map((tec) => boton(tec, tec))}
			</div>
			{/* aria-live: el lector de pantalla lee el cambio de número sin mover el foco */}
			<p class="mt-3 text-sm text-tenue" aria-live="polite">
				{activa ? `${visibles} ${textos.de} ${total} ${textos.con} ${activa}` : " "}
			</p>
		</div>
	);
}
