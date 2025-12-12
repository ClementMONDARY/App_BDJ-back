import cookie from "@fastify/cookie";
import "dotenv/config";
import Fastify, { type FastifyError } from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import authRoutes from "./routes/auth/auth.routes.js";
import questionsRoutes from "./routes/questions/question.routes.js";
import suggestionsRoutes from "./routes/suggestions/suggestion.routes.js";

process.loadEnvFile();

const app = Fastify({
	logger: true,
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(cookie, {
	secret: process.env.JWT_SECRET,
	hook: "onRequest",
});

// Routes
app.register(authRoutes, { prefix: "/auth" });
app.register(questionsRoutes, { prefix: "/questions" });
app.register(suggestionsRoutes, { prefix: "/suggestions" });

const start = async () => {
	try {
		const port = Number(process.env.PORT) || 3000;
		await app.listen({ port, host: "0.0.0.0" });
		console.log(`Server listening on http://localhost:${port}`);
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};

start();
