// Parche para CPUs sin AVX2 (p. ej. AMD FX-8350).
//
// El compilador nativo de Astro 7 (@astrojs/compiler-binding-linux-x64-gnu)
// usa instrucciones AVX2 y revienta con "Illegal instruction" en esas CPUs.
// Este script, que se ejecuta solo tras cada `npm install`, detecta la CPU y,
// si no tiene AVX2, cambia el binario nativo por la versión WebAssembly
// (un poco más lenta, pero funciona en cualquier máquina).
//
// En CPUs modernas (o en Vercel) no hace nada.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

if (process.platform !== "linux" || process.arch !== "x64") process.exit(0);

const cpuinfo = fs.readFileSync("/proc/cpuinfo", "utf8");
if (/\bavx2\b/.test(cpuinfo)) process.exit(0);

const nm = path.resolve("node_modules/@astrojs");
const nativeDir = path.join(nm, "compiler-binding-linux-x64-gnu");
const wasiDir = path.join(nm, "compiler-binding-wasm32-wasi");

const { version } = JSON.parse(
  fs.readFileSync(path.join(nm, "compiler-binding/package.json"), "utf8"),
);

if (!fs.existsSync(path.join(wasiDir, "astro.wasi.cjs"))) {
  console.log(`[fix-old-cpu] CPU sin AVX2: instalando compilador WASM de Astro (${version})...`);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "astro-wasi-"));
  const tgz = execFileSync(
    "npm",
    ["pack", `@astrojs/compiler-binding-wasm32-wasi@${version}`, "--silent"],
    { cwd: tmp, encoding: "utf8" },
  ).trim();
  fs.mkdirSync(wasiDir, { recursive: true });
  execFileSync("tar", ["-xzf", path.join(tmp, tgz), "-C", wasiDir, "--strip-components=1"]);
  fs.rmSync(tmp, { recursive: true, force: true });
}

// Sin el binario nativo, Astro cae automáticamente a la versión WASM.
if (fs.existsSync(nativeDir)) {
  fs.rmSync(nativeDir, { recursive: true, force: true });
  console.log("[fix-old-cpu] Listo: Astro usará el compilador WebAssembly.");
}
