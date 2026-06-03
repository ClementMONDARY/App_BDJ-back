import cookie from "@fastify/cookie";
import Fastify, { type FastifyInstance } from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import authRoutes from "../src/routes/auth/auth.routes.js";

/**
 * Crée une instance Fastify isolée pour les tests d'intégration.
 * Inclut systématiquement les routes /auth pour pouvoir se connecter.
 * Chaque fichier de test obtient sa propre instance (Vitest isole les workers).
 */
export async function buildTestApp(
	registerRoutes: (app: FastifyInstance) => void,
): Promise<FastifyInstance> {
	const app = Fastify({ logger: false });
	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);
	app.register(cookie, { secret: "test-secret", hook: "onRequest" });
	app.register(authRoutes, { prefix: "/auth" });
	registerRoutes(app);
	await app.ready();
	return app;
}

/**
 * Connecte un utilisateur et retourne son accessToken.
 */
export async function loginAs(
	app: FastifyInstance,
	email: string,
	password: string,
): Promise<string> {
	const res = await app.inject({
		method: "POST",
		url: "/auth/login",
		payload: { email, password },
	});
	const body = JSON.parse(res.payload);
	if (!body.accessToken) {
		throw new Error(`Login failed for ${email}: ${res.payload}`);
	}
	return body.accessToken;
}

/**
 * Inscrit un utilisateur via l'API et retourne la réponse brute.
 */
export async function signupUser(
	app: FastifyInstance,
	opts: {
		username: string;
		email: string;
		password: string;
		firstname?: string;
		lastname?: string;
	},
) {
	return app.inject({
		method: "POST",
		url: "/auth/signup",
		payload: {
			firstname: "Test",
			lastname: "User",
			...opts,
		},
	});
}
