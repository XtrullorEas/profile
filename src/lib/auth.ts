// Lógica de autenticación del admin (solo servidor).

import { timingSafeEqual } from "node:crypto";
import { ADMIN_USER, ADMIN_PASSWORD_HASH } from "astro:env/server";
import { verificarPassword } from "./password";

/** ¿Usuario y contraseña correctos? */
export function verificarCredenciales(usuario: string, password: string): boolean {
	// Comparamos el usuario también en tiempo constante
	const a = Buffer.from(usuario);
	const b = Buffer.from(ADMIN_USER);
	const usuarioOk = a.length === b.length && timingSafeEqual(a, b);

	// Verificamos la contraseña SIEMPRE (aunque el usuario esté mal) para que
	// la respuesta tarde lo mismo y no revele si el usuario existe.
	const passwordOk = verificarPassword(password, ADMIN_PASSWORD_HASH);

	return usuarioOk && passwordOk;
}

// ---------------------------------------------------------------------------
// Límite de intentos: tras 5 fallos desde una misma IP, bloqueo de 15 minutos.
// Se guarda en memoria: se reinicia si se reinicia el servidor (suficiente aquí).
// ---------------------------------------------------------------------------
const MAX_INTENTOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;
const intentos = new Map<string, { fallos: number; hasta: number }>();

/** Minutos que le quedan de bloqueo a esta IP (0 = puede intentar). */
export function minutosBloqueado(ip: string): number {
	const registro = intentos.get(ip);
	if (!registro || registro.fallos < MAX_INTENTOS) return 0;
	const restante = registro.hasta - Date.now();
	if (restante <= 0) {
		intentos.delete(ip);
		return 0;
	}
	return Math.ceil(restante / 60000);
}

export function registrarFallo(ip: string) {
	const registro = intentos.get(ip) ?? { fallos: 0, hasta: 0 };
	registro.fallos++;
	registro.hasta = Date.now() + BLOQUEO_MS;
	intentos.set(ip, registro);
}

export function limpiarFallos(ip: string) {
	intentos.delete(ip);
}
