// Hash y verificación de contraseñas con scrypt (incluido en Node, sin dependencias).
//
// ¿Por qué no guardar la contraseña tal cual? Si alguien lee el .env o la BD,
// tendría tu contraseña. Con un hash solo tiene un valor del que NO se puede
// recuperar la contraseña original.
//
// ¿Por qué scrypt y no md5/sha256? Porque es LENTO a propósito y usa mucha memoria:
// probar millones de contraseñas por fuerza bruta se vuelve carísimo.
//
// Este archivo no importa nada de Astro, así lo puede usar también el script
// scripts/crear-admin.ts desde la terminal.

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const LONGITUD = 64;

/** Devuelve "scrypt:<sal>:<hash>" (sin "$", que Vite interpretaría en el .env). */
export function hashPassword(password: string): string {
	// La "sal" es aleatoria: dos personas con la misma contraseña tienen hashes distintos
	const sal = randomBytes(16).toString("hex");
	const hash = scryptSync(password, sal, LONGITUD).toString("hex");
	return `scrypt:${sal}:${hash}`;
}

/** Compara una contraseña con un hash guardado. */
export function verificarPassword(password: string, guardado: string): boolean {
	const [algoritmo, sal, hashHex] = guardado.split(":");
	if (algoritmo !== "scrypt" || !sal || !hashHex) return false;

	const esperado = Buffer.from(hashHex, "hex");
	const calculado = scryptSync(password, sal, esperado.length);

	// timingSafeEqual tarda lo mismo aunque falle en el primer carácter o en el último,
	// así un atacante no puede adivinar el hash midiendo tiempos de respuesta.
	return esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}
