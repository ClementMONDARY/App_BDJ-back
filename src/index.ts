import cookie from "@fastify/cookie";
import "dotenv/config";
import Fastify from "fastify";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path from "node:path";
import {
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import authRoutes from "./routes/auth/auth.routes.js";
import questionsRoutes from "./routes/questions/question.routes.js";
import suggestionsRoutes from "./routes/suggestions/suggestion.routes.js";
import usersRoutes from "./routes/users/users.routes.js";
import articlesRoutes from "./routes/articles/articles.routes.js";
import notificationsRoutes from "./routes/notifications/notifications.routes.js";
import forumRoutes from "./routes/forum/forum.routes.js";
import eventsRoutes from "./routes/events/events.routes.js";
import messagingRoutes from "./routes/messaging/messaging.routes.js";

process.loadEnvFile();

const app = Fastify({
	logger: true,
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyMultipart, {
	limits: {
		fileSize: 2 * 1024 * 1024, // 2MB
	},
});

app.register(fastifyStatic, {
	root: path.join(process.cwd(), "assets"),
	prefix: "/assets/",
	decorateReply: false, // Important when registering static twice
});

app.register(fastifyStatic, {
	root: path.join(process.cwd(), "uploads"),
	prefix: "/uploads/",
	decorateReply: false,
});

app.register(cookie, {
	secret: process.env.JWT_SECRET,
	hook: "onRequest",
});

// Routes
app.register(authRoutes, { prefix: "/auth" });
app.register(questionsRoutes, { prefix: "/questions" });
app.register(suggestionsRoutes, { prefix: "/suggestions" });
app.register(usersRoutes, { prefix: "/users" });
app.register(articlesRoutes, { prefix: "/articles" });
app.register(notificationsRoutes, { prefix: "/notifications" });
app.register(forumRoutes, { prefix: "/forum" });
app.register(eventsRoutes, { prefix: "/events" });
app.register(messagingRoutes, { prefix: "/messaging" });

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
