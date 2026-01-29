import fs from "node:fs/promises";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import sql from "../../db/db.js";
import {
	authenticate,
	createAccessToken,
	createRefreshToken,
	hashPassword,
	revokeRefreshToken,
	revokeAllUserSessions,
	verifyPassword,
	verifyRefreshToken,
} from "../../plugins/auth.js";
import {
	loginSchema,
	logoutSchema,
	messageResponseSchema,
	refreshSchema,
	signupSchema,
	tokenResponseSchema,
	userResponseSchema,
} from "./schema/auth.schema.js";
import type { UserResponse } from "../users/schema/users.schema.js";

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

			// Logic to select random avatar
			let avatarUrl: string;
			try {
				const avatarsDir = path.join(
					process.cwd(),
					"assets",
					"images",
					"avatars",
				);
				const files = await fs.readdir(avatarsDir);
				const imageFiles = files.filter((file) =>
					/\.(png|jpg|jpeg|gif|webp)$/i.test(file),
				);

				if (imageFiles.length > 0) {
					const randomFile =
						imageFiles[Math.floor(Math.random() * imageFiles.length)];
					const baseUrl =
						process.env.BASE_URL || `${request.protocol}://${request.hostname}`;
					avatarUrl = `${baseUrl}/assets/images/avatars/${randomFile}`;
				} else {
					// Fallback if no images found
					avatarUrl = `https://avatar.iran.liara.run/public?username=${username}`;
				}
			} catch (error) {
				console.error("Error reading avatars directory:", error);
				// Fallback on error
				avatarUrl = `https://avatar.iran.liara.run/public?username=${username}`;
			}

			// Transactional insert
			const newUser = await sql.begin(async (sql) => {
				const [user] = await sql<UserResponse[]>`
        INSERT INTO users (username, firstname, lastname, avatar)
        VALUES (${username}, ${firstname || null}, ${lastname || null}, ${avatarUrl})
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
				response: {
					200: tokenResponseSchema,
					401: messageResponseSchema,
				},
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

			const accessToken = await createAccessToken({
				id: authData.id,
				username: authData.username,
				role: authData.role,
			});

			const refreshToken = await createRefreshToken(authData.id);

			return reply.send({ accessToken, refreshToken });
		},
	);

	// Refresh Token
	app.withTypeProvider<ZodTypeProvider>().post(
		"/refresh",
		{
			schema: {
				body: refreshSchema,
				response: {
					200: tokenResponseSchema,
					401: messageResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const { refreshToken } = request.body;
			const userId = await verifyRefreshToken(refreshToken);

			if (!userId) {
				return reply.status(401).send({ message: "Invalid refresh token" });
			}

			const [user] = await sql`
        SELECT id, username, role 
        FROM users 
        WHERE id = ${userId}
      `;

			if (!user) {
				return reply.status(401).send({ message: "User not found" });
			}

			// Rotate tokens
			await revokeRefreshToken(refreshToken);
			const newAccessToken = await createAccessToken({
				id: user.id,
				username: user.username,
				role: user.role,
			});
			const newRefreshToken = await createRefreshToken(user.id);

			return reply.send({
				accessToken: newAccessToken,
				refreshToken: newRefreshToken,
			});
		},
	);

	// Logout
	app.withTypeProvider<ZodTypeProvider>().post(
		"/logout",
		{
			schema: {
				body: logoutSchema,
				response: {
					200: messageResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const { refreshToken } = request.body;
			await revokeRefreshToken(refreshToken);
			return reply.send({ message: "Logged out successfully" });
		},
	);

	// Revoke All Sessions (Protected)
	app.withTypeProvider<ZodTypeProvider>().post(
		"/revoke-all-sessions",
		{
			schema: {
				response: {
					200: messageResponseSchema,
					401: messageResponseSchema,
				},
			},
			preHandler: [authenticate],
		},
		async (request, reply) => {
			if (!request.user) {
				return reply.status(401).send({ message: "Unauthorized" });
			}
			await revokeAllUserSessions(request.user.id);
			return reply.send({ message: "All sessions revoked successfully" });
		},
	);

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
