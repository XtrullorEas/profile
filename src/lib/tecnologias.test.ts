// Pruebas de src/lib/tecnologias.ts. Ejecuta: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { iconoDe, aNombresDelCatalogo } from "./tecnologias.ts";

test("iconoDe encuentra nombres y alias", () => {
	assert.equal(iconoDe("PHP"), "logos:php");
	assert.equal(iconoDe("js"), "logos:javascript");
	assert.equal(iconoDe("Node.js"), "logos:nodejs-icon");
	assert.equal(iconoDe("Tailwind CSS"), "logos:tailwindcss-icon");
	assert.equal(iconoDe("css"), "logos:css-3");
	assert.equal(iconoDe("Microsoft SQL Server"), "devicon:microsoftsqlserver");
	assert.equal(iconoDe("mssql"), "devicon:microsoftsqlserver");
	assert.equal(iconoDe("Cobol"), undefined);
});

test("aNombresDelCatalogo normaliza y conserva lo desconocido", () => {
	assert.deepEqual(aNombresDelCatalogo("html, JS ,Tailwind CSS,, Cobol"), ["HTML", "JavaScript", "Tailwind", "Cobol"]);
	assert.deepEqual(aNombresDelCatalogo(""), []);
});
