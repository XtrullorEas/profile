// Pruebas de src/lib/fechas.ts. Ejecuta: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { periodo, duracion } from "./fechas.ts";

const d = (s: string) => new Date(s);

test("periodo", () => {
	assert.equal(periodo(d("2023-03-01"), d("2025-06-01")), "mar 2023 – jun 2025");
	assert.equal(periodo(d("2024-01-01"), d("2024-05-01")), "ene 2024 – may 2024");
	assert.equal(periodo(d("2024-05-01"), d("2024-05-01")), "may 2024"); // empezó y terminó el mismo mes
	assert.equal(periodo(d("2025-02-01"), null), "feb 2025 – actualidad");
});

test("duracion", () => {
	assert.equal(duracion(d("2024-01-01"), d("2024-06-01")), "5 meses");
	assert.equal(duracion(d("2023-01-01"), d("2024-04-01")), "1 año y 3 meses");
	assert.equal(duracion(d("2022-01-01"), d("2024-01-01")), "2 años");
	assert.equal(duracion(d("2024-01-01"), d("2024-01-15")), "1 mes"); // mínimo 1 mes
});

test("en inglés", () => {
	assert.equal(periodo(d("2023-03-01"), d("2025-06-01"), "en"), "Mar 2023 – Jun 2025");
	assert.equal(periodo(d("2025-02-01"), null, "en"), "Feb 2025 – present");
	assert.equal(duracion(d("2023-01-01"), d("2024-04-01"), "en"), "1 year and 3 months");
	assert.equal(duracion(d("2022-01-01"), d("2024-01-01"), "en"), "2 years");
	assert.equal(duracion(d("2024-01-01"), d("2024-02-01"), "en"), "1 month");
});
