import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import sql from "../../db/db.js";
import type { UserRow } from "../../models/user.model";
import {
	authenticate,
	createSessionToken,
	hashPassword,
	verifyPassword,
} from "../../plugins/auth.js";
import {
	loginSchema,
	messageResponseSchema,
	signupSchema,
	userResponseSchema,
} from "./auth.schema.js";

export default async function authRoutes(app: FastifyInstance) {
	// Signup
	app.withTypeProvider<ZodTypeProvider>().post(
		"/signup",
		{
			schema: {
				body: signupSchema,
				response: {
					201: userResponseSchema,
					409: messageResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const { username, email, password, firstname, lastname } = request.body;

			// Check if user already exists
			const existingUser = await sql`
      SELECT 1 FROM users WHERE username = ${username}
      UNION
      SELECT 1 FROM user_auth WHERE email = ${email}
    `;

			if (existingUser.length > 0) {
				return reply
					.status(409)
					.send({ message: "Username or email already exists" });
			}

			const passwordHash = await hashPassword(password);

			// Transactional insert
			const newUser = await sql.begin(async (sql) => {
				const [user] = await sql<UserRow[]>`
        INSERT INTO users (username, firstname, lastname)
        VALUES (${username}, ${firstname || null}, ${lastname || null})
        RETURNING *
      `;

				await sql`
        INSERT INTO user_auth (user_id, email, password_hash)
        VALUES (${user.id}, ${email}, ${passwordHash})
      `;

				return { ...user, email };
			});

			return reply.status(201).send(newUser);
		},
	);

	// Login
	app.withTypeProvider<ZodTypeProvider>().post(
		"/login",
		{
			schema: {
				body: loginSchema,
			},
		},
		async (request, reply) => {
			const { email, password } = request.body;

			const [authData] = await sql`
      SELECT ua.password_hash, u.id, u.username, u.role
      FROM user_auth ua
      JOIN users u ON u.id = ua.user_id
      WHERE ua.email = ${email}
    `;

			if (!authData) {
				return reply.status(401).send({ message: "Invalid email or password" });
			}

			const isValid = await verifyPassword(authData.password_hash, password);

			if (!isValid) {
				return reply.status(401).send({ message: "Invalid email or password" });
			}

			const token = await createSessionToken({
				id: authData.id,
				username: authData.username,
				role: authData.role,
			});

			reply.setCookie("token", token, {
				path: "/",
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 7 * 24 * 60 * 60, // 7 days
			});

			return reply.send({ message: "Logged in successfully" });
		},
	);

	// Logout
	app.post("/logout", async (_request, reply) => {
		reply.clearCookie("token", { path: "/" });
		return reply.send({ message: "Logged out successfully" });
	});

	// Me (Protected)
	app.withTypeProvider<ZodTypeProvider>().get(
		"/me",
		{
			preHandler: [authenticate],
		},
		async (request, reply) => {
			const user = request.user;

			const [userData] = await sql`
        SELECT u.*, ua.email 
        FROM users u
        JOIN user_auth ua ON ua.user_id = u.id
        WHERE u.id = ${user.id}
    `;

			if (!userData) {
				return reply.status(404).send({ message: "User not found" });
			}

			return reply.send(userData);
		},
	);
}
