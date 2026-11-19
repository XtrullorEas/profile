CREATE TABLE "experiencia" (
	"id" serial PRIMARY KEY NOT NULL,
	"empresa" varchar(120) NOT NULL,
	"logo" varchar(255),
	"cargo" varchar(120) NOT NULL,
	"inicio" date NOT NULL,
	"fin" date,
	"logros" text[] DEFAULT '{}' NOT NULL,
	"tecnologias" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "perfil" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(80) NOT NULL,
	"rol" varchar(80) NOT NULL,
	"frase" varchar(160) NOT NULL,
	"bio" text NOT NULL,
	"foto" varchar(255),
	"email" varchar(160),
	"github" varchar(255),
	"linkedin" varchar(255),
	"disponible" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "proyectos" ADD COLUMN "logros" text[] DEFAULT '{}' NOT NULL;