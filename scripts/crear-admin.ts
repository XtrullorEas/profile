// Crea o cambia el usuario y la contraseña del admin.
// Uso:  npm run admin:password
//
// Pide los datos por la terminal (la contraseña no se ve al escribir),
// calcula el hash y lo guarda en .env. La contraseña en texto plano no se guarda nunca.
// Node 24+ ejecuta TypeScript directamente, sin compilar.

import { existsSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { hashPassword } from "../src/lib/password.ts";

// Salida "silenciable": mientras se escribe la contraseña, no mostramos nada.
let silenciado = false;
const salida = new Writable({
	write(chunk, _enc, cb) {
		if (!silenciado) process.stdout.write(chunk);
		cb();
	},
});

// UN solo readline para todas las preguntas. Leemos las líneas con un iterador:
// guarda en cola las que llegan antes de tiempo (si pegas todo de golpe no se pierde nada).
const rl = createInterface({ input: process.stdin, output: salida, terminal: process.stdin.isTTY });
const lineas = rl[Symbol.asyncIterator]();

async function preguntar(texto: string, oculto = false) {
	process.stdout.write(texto);
	// Ocultamos el "eco" de lo que se escribe solo en la contraseña
	silenciado = oculto;
	const { value, done } = await lineas.next();
	if (done) salir("\n✗ Cancelado. No se guardó nada.");
	silenciado = false;
	if (oculto) process.stdout.write("\n");
	return String(value ?? "");
}

function salir(mensaje: string): never {
	console.error(mensaje);
	rl.close();
	process.exit(1);
}

/** Pone (o reemplaza) una línea CLAVE=valor en el contenido del .env */
function setVar(env: string, clave: string, valor: string) {
	const linea = `${clave}=${valor}`;
	const regex = new RegExp(`^${clave}=.*$`, "m");
	return regex.test(env) ? env.replace(regex, linea) : `${env.trimEnd()}\n${linea}\n`;
}

// Si algo no es válido, volvemos a preguntar (en vez de salir sin guardar nada)
let usuario = "";
while (true) {
	usuario = (await preguntar("Usuario del admin: ")).trim();
	if (/^[a-zA-Z0-9_.-]{3,32}$/.test(usuario)) break;
	console.log("✗ Usuario inválido (3-32 caracteres: letras, números, _ . -). Prueba otra vez.");
}

let password = "";
while (true) {
	password = await preguntar("Contraseña (mín. 6 caracteres): ", true);
	if (password.length < 6) {
		console.log(`✗ Tiene ${password.length} caracteres, necesita al menos 6. Prueba otra vez.`);
		continue;
	}
	const repetir = await preguntar("Repite la contraseña: ", true);
	if (password === repetir) break;
	console.log("✗ Las contraseñas no coinciden. Prueba otra vez.");
}

rl.close();

let env = existsSync(".env") ? readFileSync(".env", "utf8") : "";
if (!env.includes("ADMIN_USER=")) env = `${env.trimEnd()}\n\n# Admin del portfolio (npm run admin:password)\n`;
env = setVar(env, "ADMIN_USER", usuario);
env = setVar(env, "ADMIN_PASSWORD_HASH", hashPassword(password));

writeFileSync(".env", env);
chmodSync(".env", 0o600);
console.log(`✓ Admin "${usuario}" guardado en .env. Reinicia el servidor: npx astro dev stop && npm run dev`);
