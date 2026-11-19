// Definición de las TABLAS de la base de datos, en TypeScript.
// Drizzle usa este archivo para dos cosas:
//   1. Generar las migraciones SQL (drizzle-kit generate)
//   2. Darte tipos en las consultas: si escribes proyectos.titluo, TypeScript te avisa.

import { pgTable, serial, varchar, text, date, boolean, timestamp } from "drizzle-orm/pg-core";

export const proyectos = pgTable("proyectos", {
	id: serial("id").primaryKey(),

	// Identificador para la URL: /proyectos/the-myoopy-bar
	slug: varchar("slug", { length: 120 }).notNull().unique(),

	titulo: varchar("titulo", { length: 120 }).notNull(),
	resumen: varchar("resumen", { length: 160 }).notNull(), // texto corto para la tarjeta
	contenido: text("contenido").notNull().default(""), // texto largo, en Markdown
	// Versión en inglés (opcional: si está vacía, /en muestra el español)
	resumenEn: varchar("resumen_en", { length: 160 }),
	contenidoEn: text("contenido_en"),

	// mode "date" → Drizzle nos lo devuelve como objeto Date de JS
	fecha: date("fecha", { mode: "date" }).notNull(),

	// Postgres soporta arrays nativos: ['HTML', 'CSS', 'JavaScript']
	tecnologias: text("tecnologias").array().notNull().default([]),

	portada: varchar("portada", { length: 255 }), // ruta de la imagen subida (opcional)
	// Galería: más capturas, en orden. Vacía = el proyecto se muestra igual que siempre
	galeria: text("galeria").array().notNull().default([]),
	repo: varchar("repo", { length: 255 }),
	demo: varchar("demo", { length: 255 }),

	// Logros concretos, uno por pastilla: ["Landing en menos de 1 s", ...]
	logros: text("logros").array().notNull().default([]),
	logrosEn: text("logros_en").array().notNull().default([]),

	destacado: boolean("destacado").notNull().default(false), // aparece en la portada
	borrador: boolean("borrador").notNull().default(false), // oculto en el sitio

	creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
	actualizadoEn: timestamp("actualizado_en", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()), // Drizzle la actualiza sola en cada UPDATE
});

// Experiencia laboral: un trabajo por fila.
export const experiencia = pgTable("experiencia", {
	id: serial("id").primaryKey(),
	empresa: varchar("empresa", { length: 120 }).notNull(),
	logo: varchar("logo", { length: 255 }), // imagen subida desde el admin (opcional)
	cargo: varchar("cargo", { length: 120 }).notNull(),
	cargoEn: varchar("cargo_en", { length: 120 }),
	inicio: date("inicio", { mode: "date" }).notNull(),
	fin: date("fin", { mode: "date" }), // null = trabajo actual
	logros: text("logros").array().notNull().default([]),
	logrosEn: text("logros_en").array().notNull().default([]),
	tecnologias: text("tecnologias").array().notNull().default([]),
});

// Perfil: UNA sola fila (id = 1) con tus datos de la portada.
export const perfil = pgTable("perfil", {
	id: serial("id").primaryKey(),
	nombre: varchar("nombre", { length: 80 }).notNull(),
	rol: varchar("rol", { length: 80 }).notNull(),
	frase: varchar("frase", { length: 160 }).notNull(), // la frase grande del inicio
	bio: text("bio").notNull(),
	// En inglés (opcionales: si están vacíos, /en muestra el español)
	rolEn: varchar("rol_en", { length: 80 }),
	fraseEn: varchar("frase_en", { length: 160 }),
	bioEn: text("bio_en"),
	// Listas que antes estaban fijas en el código de la portada
	stack: text("stack").array().notNull().default([]),
	hobbies: text("hobbies").array().notNull().default([]),
	hobbiesEn: text("hobbies_en").array().notNull().default([]),
	foto: varchar("foto", { length: 255 }),
	email: varchar("email", { length: 160 }),
	github: varchar("github", { length: 255 }),
	linkedin: varchar("linkedin", { length: 255 }),
	whatsapp: varchar("whatsapp", { length: 30 }), // "+51 915353137": el enlace usa solo los dígitos
	disponible: boolean("disponible").notNull().default(false), // insignia "Disponible para trabajar"
});

// Tipos derivados de la tabla, para usarlos en componentes y formularios:
export type Proyecto = typeof proyectos.$inferSelect; // una fila leída
export type NuevoProyecto = typeof proyectos.$inferInsert; // datos para insertar
export type Experiencia = typeof experiencia.$inferSelect;
export type Perfil = typeof perfil.$inferSelect;
