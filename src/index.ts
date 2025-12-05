import cookie from "@fastify/cookie";
import "dotenv/config";
import Fastify, { type FastifyError } from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import authRoutes from "./routes/auth/auth.routes.js";

process.loadEnvFile();

const app = Fastify({
	logger: true,
});

// Zod validation configuration
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Plugins
app.register(cookie, {
	secret: process.env.JWT_SECRET,
	hook: "onRequest",
});

// Routes
app.register(authRoutes, { prefix: "/auth" });

// Global Error Handler (Optional but good practice)
app.setErrorHandler((error: FastifyError, _request, reply) => {
	app.log.error(error);
	reply.status(error.statusCode || 500).send({
		message: error.message || "Internal Server Error",
		code: error.code,
	});
});

// Start server
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
