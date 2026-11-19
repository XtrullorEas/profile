// Pruebas de src/lib/frase.ts. Ejecuta: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { separarFrase, fraseEnTexto, parrafosDeBio } from "./frase.ts";

test("separarFrase encuentra las palabras que rotan", () => {
	assert.deepEqual(separarFrase("[Fullstack|automatización|agentes de IA]. Hago que..."), {
		antes: "",
		palabras: ["Fullstack", "automatización", "agentes de IA"],
		despues: ". Hago que...",
	});
	assert.deepEqual(separarFrase("Construyo [webs | apps] rápidas"), { antes: "Construyo ", palabras: ["webs", "apps"], despues: " rápidas" });
});

test("separarFrase: sin corchetes o con una sola palabra no hay efecto", () => {
	assert.equal(separarFrase("Una frase normal."), null);
	assert.equal(separarFrase("[Solo] una"), null);
	assert.equal(separarFrase("[a||] b"), null);
});

test("fraseEnTexto arma la lista en cada idioma", () => {
	assert.equal(
		fraseEnTexto("[Fullstack|automatización|agentes de IA]. Hago que la tecnología trabaje por las personas."),
		"Fullstack, automatización y agentes de IA. Hago que la tecnología trabaje por las personas.",
	);
	assert.equal(fraseEnTexto("[Full-stack|automation|AI agents]. I make tech work.", "en"), "Full-stack, automation, and AI agents. I make tech work.");
	assert.equal(fraseEnTexto("Sin efecto."), "Sin efecto.");
});

test("parrafosDeBio separa párrafos y marca el texto cifrado", () => {
	assert.deepEqual(parrafosDeBio("Uno.\r\n\r\nDos.\n\n[Tres cifrado.]"), [
		[{ texto: "Uno.", cifrado: false }],
		[{ texto: "Dos.", cifrado: false }],
		[{ texto: "Tres cifrado.", cifrado: true }],
	]);
	assert.deepEqual(parrafosDeBio("Hola [mundo] y más"), [
		[
			{ texto: "Hola ", cifrado: false },
			{ texto: "mundo", cifrado: true },
			{ texto: " y más", cifrado: false },
		],
	]);
	assert.deepEqual(parrafosDeBio("Sin efecto"), [[{ texto: "Sin efecto", cifrado: false }]]);
});
