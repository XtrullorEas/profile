// Pruebas de src/i18n/index.ts. Ejecuta: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { ruta, rutaEnOtroIdioma, traducido, traductor, idiomaDe } from "./index.ts";

test("ruta pone /en delante solo en inglés", () => {
	assert.equal(ruta("es", "/proyectos"), "/proyectos");
	assert.equal(ruta("en", "/proyectos"), "/en/proyectos");
	assert.equal(ruta("en", "/"), "/en/");
	assert.equal(ruta("en", "/#contacto"), "/en/#contacto");
});

test("rutaEnOtroIdioma va y vuelve", () => {
	assert.equal(rutaEnOtroIdioma("/proyectos/x", "es"), "/en/proyectos/x");
	assert.equal(rutaEnOtroIdioma("/en/proyectos/x", "en"), "/proyectos/x");
	assert.equal(rutaEnOtroIdioma("/", "es"), "/en/");
	assert.equal(rutaEnOtroIdioma("/en/", "en"), "/");
	assert.equal(rutaEnOtroIdioma("/en", "en"), "/");
});

test("traducido usa el inglés solo si existe", () => {
	assert.equal(traducido("en", "Hola", "Hello"), "Hello");
	assert.equal(traducido("es", "Hola", "Hello"), "Hola");
	assert.equal(traducido("en", "Hola", null), "Hola");
	assert.equal(traducido("en", "Hola", "  "), "Hola");
	assert.deepEqual(traducido("en", ["a"], []), ["a"]);
	assert.deepEqual(traducido("en", ["a"], ["b"]), ["b"]);
});

test("traductor e idiomaDe", () => {
	assert.equal(traductor("en")("menu.proyectos"), "Projects");
	assert.equal(traductor("es")("menu.proyectos"), "Proyectos");
	assert.equal(idiomaDe("en"), "en");
	assert.equal(idiomaDe(undefined), "es");
});
