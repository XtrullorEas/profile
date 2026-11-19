CREATE TABLE "experiencia" (
	"id" serial PRIMARY KEY NOT NULL,
	"empresa" varchar(120) NOT NULL,
	"logo" varchar(255),
	"cargo" varchar(120) NOT NULL,
	"cargo_en" varchar(120),
	"inicio" date NOT NULL,
	"fin" date,
	"logros" text[] DEFAULT '{}' NOT NULL,
	"logros_en" text[] DEFAULT '{}' NOT NULL,
	"tecnologias" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "perfil" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(80) NOT NULL,
	"rol" varchar(80) NOT NULL,
	"frase" varchar(160) NOT NULL,
	"bio" text NOT NULL,
	"rol_en" varchar(80),
	"frase_en" varchar(160),
	"bio_en" text,
	"stack" text[] DEFAULT '{}' NOT NULL,
	"hobbies" text[] DEFAULT '{}' NOT NULL,
	"hobbies_en" text[] DEFAULT '{}' NOT NULL,
	"foto" varchar(255),
	"cv" varchar(255),
	"cv_en" varchar(255),
	"email" varchar(160),
	"github" varchar(255),
	"linkedin" varchar(255),
	"whatsapp" varchar(30),
	"disponible" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proyectos" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"titulo" varchar(120) NOT NULL,
	"resumen" varchar(160) NOT NULL,
	"contenido" text DEFAULT '' NOT NULL,
	"resumen_en" varchar(160),
	"contenido_en" text,
	"fecha" date NOT NULL,
	"tecnologias" text[] DEFAULT '{}' NOT NULL,
	"portada" varchar(255),
	"galeria" text[] DEFAULT '{}' NOT NULL,
	"repo" varchar(255),
	"demo" varchar(255),
	"logros" text[] DEFAULT '{}' NOT NULL,
	"logros_en" text[] DEFAULT '{}' NOT NULL,
	"destacado" boolean DEFAULT false NOT NULL,
	"borrador" boolean DEFAULT false NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "proyectos_slug_unique" UNIQUE("slug")
);
