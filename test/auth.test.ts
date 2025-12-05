import cookie from "@fastify/cookie";
import Fastify, { type FastifyInstance } from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import sql from "../src/db/db.js";
import authRoutes from "../src/routes/auth/auth.routes.js";

describe("Auth Routes", () => {
	let app: FastifyInstance;

	beforeAll(async () => {
		app = Fastify();
		app.setValidatorCompiler(validatorCompiler);
		app.setSerializerCompiler(serializerCompiler);
		app.register(cookie, {
			secret: "test-secret",
			hook: "onRequest",
		});
		app.register(authRoutes, { prefix: "/auth" });
		await app.ready();

		// Cleanup DB
		try {
			await sql`DELETE FROM refresh_tokens`;
			await sql`DELETE FROM user_auth`;
			await sql`DELETE FROM users`;
		} catch (e) {
			console.error("DB Cleanup failed", e);
		}
	});

	afterAll(async () => {
		await app.close();
		await sql.end();
	});

	it("should sign up a new user", async () => {
		const response = await app.inject({
			method: "POST",
			url: "/auth/signup",
			payload: {
				username: "testuser",
				email: "test@example.com",
				password: "password123",
				firstname: "Test",
				lastname: "User",
			},
		});

		expect(response.statusCode).toBe(201);
		const body = JSON.parse(response.payload);
		expect(body.username).toBe("testuser");
		expect(body.email).toBe("test@example.com");
		expect(body.id).toBeDefined();
	});

	it("should login with valid credentials and return tokens", async () => {
		const response = await app.inject({
			method: "POST",
			url: "/auth/login",
			payload: {
				email: "test@example.com",
				password: "password123",
			},
		});

		expect(response.statusCode).toBe(200);
		const body = JSON.parse(response.payload);
		expect(body.accessToken).toBeDefined();
		expect(body.refreshToken).toBeDefined();
	});

	it("should fail login with invalid credentials", async () => {
		const response = await app.inject({
			method: "POST",
			url: "/auth/login",
			payload: {
				email: "test@example.com",
				password: "wrongpassword",
			},
		});

		expect(response.statusCode).toBe(401);
	});

	it("should access protected route with access token", async () => {
		// Login first to get token
		const loginRes = await app.inject({
			method: "POST",
			url: "/auth/login",
			payload: {
				email: "test@example.com",
				password: "password123",
			},
		});

		const { accessToken } = JSON.parse(loginRes.payload);

		const response = await app.inject({
			method: "GET",
			url: "/auth/me",
			headers: {
				authorization: `Bearer ${accessToken}`,
			},
		});

		expect(response.statusCode).toBe(200);
		const body = JSON.parse(response.payload);
		expect(body.username).toBe("testuser");
	});

	it("should refresh token and rotate it", async () => {
		// Login
		const loginRes = await app.inject({
			method: "POST",
			url: "/auth/login",
			payload: {
				email: "test@example.com",
				password: "password123",
			},
		});
		const { refreshToken } = JSON.parse(loginRes.payload);

		const refreshRes = await app.inject({
			method: "POST",
			url: "/auth/refresh",
			payload: { refreshToken },
		});

		expect(refreshRes.statusCode).toBe(200);
		const body = JSON.parse(refreshRes.payload);
		expect(body.accessToken).toBeDefined();
		expect(body.refreshToken).toBeDefined();
		expect(body.refreshToken).not.toBe(refreshToken); // Rotation check
	});

	it("should logout and invalidate refresh token", async () => {
		// Login
		const loginRes = await app.inject({
			method: "POST",
			url: "/auth/login",
			payload: {
				email: "test@example.com",
				password: "password123",
			},
		});
		const { refreshToken } = JSON.parse(loginRes.payload);

		const logoutRes = await app.inject({
			method: "POST",
			url: "/auth/logout",
			payload: { refreshToken },
		});

		expect(logoutRes.statusCode).toBe(200);

		// Try refresh again
		const refreshRes = await app.inject({
			method: "POST",
			url: "/auth/refresh",
			payload: { refreshToken },
		});
		expect(refreshRes.statusCode).toBe(401);
	});
});
