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

	// mode "date" → Drizzle nos lo devuelve como objeto Date de JS
	fecha: date("fecha", { mode: "date" }).notNull(),

	// Postgres soporta arrays nativos: ['HTML', 'CSS', 'JavaScript']
	tecnologias: text("tecnologias").array().notNull().default([]),

	portada: varchar("portada", { length: 255 }), // ruta de la imagen subida (opcional)
	repo: varchar("repo", { length: 255 }),
	demo: varchar("demo", { length: 255 }),

	destacado: boolean("destacado").notNull().default(false), // aparece en la portada
	borrador: boolean("borrador").notNull().default(false), // oculto en el sitio

	creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
	actualizadoEn: timestamp("actualizado_en", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()), // Drizzle la actualiza sola en cada UPDATE
});

// Tipos derivados de la tabla, para usarlos en componentes y formularios:
export type Proyecto = typeof proyectos.$inferSelect; // una fila leída
export type NuevoProyecto = typeof proyectos.$inferInsert; // datos para insertar
