import { defineConfig } from "vitest/config";

// En dehors de Docker, le conteneur PostgreSQL est accessible via localhost
// (port-forwarding défini dans docker-compose.yml : POSTGRES_PORT:5432).
// process.loadEnvFile() dans db.ts ne remplace PAS les variables déjà présentes,
// donc cet override a la priorité sur le DATABASE_URL du .env qui cible "db".
export default defineConfig({
	test: {
		env: {
			POSTGRES_HOST: process.env.POSTGRES_HOST ?? "localhost",
			DATABASE_URL:
				process.env.DATABASE_URL ??
				"postgres://user:password@localhost:5432/app_bdj",
		},

		// Les fichiers de test s'exécutent chacun dans un worker isolé
		// avec leurs propres instances de modules (connexion DB indépendante par fichier).
		pool: "threads",
		poolOptions: {
			threads: {
				isolate: true,
			},
		},
	},
});
