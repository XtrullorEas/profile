CREATE TABLE "proyectos" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"titulo" varchar(120) NOT NULL,
	"resumen" varchar(160) NOT NULL,
	"contenido" text DEFAULT '' NOT NULL,
	"fecha" date NOT NULL,
	"tecnologias" text[] DEFAULT '{}' NOT NULL,
	"portada" varchar(255),
	"repo" varchar(255),
	"demo" varchar(255),
	"destacado" boolean DEFAULT false NOT NULL,
	"borrador" boolean DEFAULT false NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "proyectos_slug_unique" UNIQUE("slug")
);
