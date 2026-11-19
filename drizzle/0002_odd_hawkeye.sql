ALTER TABLE "experiencia" ADD COLUMN "cargo_en" varchar(120);--> statement-breakpoint
ALTER TABLE "experiencia" ADD COLUMN "logros_en" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "perfil" ADD COLUMN "rol_en" varchar(80);--> statement-breakpoint
ALTER TABLE "perfil" ADD COLUMN "frase_en" varchar(160);--> statement-breakpoint
ALTER TABLE "perfil" ADD COLUMN "bio_en" text;--> statement-breakpoint
ALTER TABLE "perfil" ADD COLUMN "stack" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "perfil" ADD COLUMN "hobbies" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "perfil" ADD COLUMN "hobbies_en" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "proyectos" ADD COLUMN "resumen_en" varchar(160);--> statement-breakpoint
ALTER TABLE "proyectos" ADD COLUMN "contenido_en" text;--> statement-breakpoint
ALTER TABLE "proyectos" ADD COLUMN "logros_en" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
-- Las listas que estaban fijas en src/pages/index.astro pasan a tu perfil (solo si están vacías)
UPDATE "perfil" SET "stack" = '{HTML,CSS,JavaScript,TypeScript,Astro,Tailwind,PHP,MySQL,PostgreSQL,Docker,Ubuntu,Git}' WHERE cardinality("stack") = 0;--> statement-breakpoint
UPDATE "perfil" SET "hobbies" = '{Programación,Videojuegos,Música,Cine,Deportes}', "hobbies_en" = '{Programming,Video games,Music,Movies,Sports}' WHERE cardinality("hobbies") = 0;
