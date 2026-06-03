import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import sql from "../src/db/db.js";
import articlesRoutes from "../src/routes/articles/articles.routes.js";
import { buildTestApp, loginAs, signupUser } from "./helpers.js";

// Identifiants isolés — ne jamais réutiliser dans un autre fichier de test
const ADMIN = {
	username: "test-articles-admin",
	email: "test-articles-admin@test.local",
	password: "password123",
};
const USER = {
	username: "test-articles-user",
	email: "test-articles-user@test.local",
	password: "password123",
};

describe("Articles Routes", () => {
	let app: FastifyInstance;
	let adminToken: string;
	let userToken: string;
	let sharedArticleId: number; // article créé en beforeAll, réutilisé dans plusieurs tests

	beforeAll(async () => {
		app = await buildTestApp((a) =>
			a.register(articlesRoutes, { prefix: "/articles" }),
		);

		// Nettoyage défensif des éventuels résidus d'un run précédent
		await sql`DELETE FROM article_likes WHERE article_id IN (SELECT id FROM articles WHERE title LIKE '[TEST]%')`;
		await sql`DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE username = ANY(${[ADMIN.username, USER.username]}))`;
		await sql`DELETE FROM articles WHERE title LIKE '[TEST]%'`;
		await sql`DELETE FROM refresh_tokens WHERE user_id IN (SELECT id FROM users WHERE username = ANY(${[ADMIN.username, USER.username]}))`;
		await sql`DELETE FROM user_auth WHERE email = ANY(${[ADMIN.email, USER.email]})`;
		await sql`DELETE FROM users WHERE username = ANY(${[ADMIN.username, USER.username]})`;

		// Création du compte admin et promotion du rôle
		await signupUser(app, { ...ADMIN, firstname: "Admin", lastname: "Test" });
		await sql`UPDATE users SET role = 'admin' WHERE username = ${ADMIN.username}`;

		// Création du compte utilisateur standard
		await signupUser(app, { ...USER, firstname: "User", lastname: "Test" });

		// Connexion
		adminToken = await loginAs(app, ADMIN.email, ADMIN.password);
		userToken = await loginAs(app, USER.email, USER.password);

		// Article partagé entre les tests de lecture / like / update / delete
		const res = await app.inject({
			method: "POST",
			url: "/articles",
			headers: { authorization: `Bearer ${adminToken}` },
			payload: { title: "[TEST] Shared Article", content: "Contenu de test partagé." },
		});
		sharedArticleId = JSON.parse(res.payload).id;
	});

	afterAll(async () => {
		await sql`DELETE FROM article_likes WHERE article_id IN (SELECT id FROM articles WHERE title LIKE '[TEST]%')`;
		await sql`DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE username = ANY(${[ADMIN.username, USER.username]}))`;
		await sql`DELETE FROM articles WHERE title LIKE '[TEST]%'`;
		await sql`DELETE FROM refresh_tokens WHERE user_id IN (SELECT id FROM users WHERE username = ANY(${[ADMIN.username, USER.username]}))`;
		await sql`DELETE FROM user_auth WHERE email = ANY(${[ADMIN.email, USER.email]})`;
		await sql`DELETE FROM users WHERE username = ANY(${[ADMIN.username, USER.username]})`;
		await app.close();
		await sql.end();
	});

	// ─────────────────────────────────────────────
	// GET /articles
	// ─────────────────────────────────────────────

	it("should list articles without authentication", async () => {
		const res = await app.inject({ method: "GET", url: "/articles" });
		expect(res.statusCode).toBe(200);
		expect(Array.isArray(JSON.parse(res.payload))).toBe(true);
	});

	it("should expose is_liked=false on each article when not authenticated", async () => {
		const res = await app.inject({ method: "GET", url: "/articles" });
		const articles = JSON.parse(res.payload) as Array<{ id: number; is_liked: boolean }>;
		const found = articles.find((a) => a.id === sharedArticleId);
		expect(found).toBeDefined();
		expect(found?.is_liked).toBe(false);
	});

	it("should expose is_liked=true for an article the authenticated user liked", async () => {
		// Like via l'API
		await app.inject({
			method: "POST",
			url: `/articles/${sharedArticleId}/like`,
			headers: { authorization: `Bearer ${userToken}` },
		});

		const res = await app.inject({
			method: "GET",
			url: "/articles",
			headers: { authorization: `Bearer ${userToken}` },
		});
		const articles = JSON.parse(res.payload) as Array<{ id: number; is_liked: boolean }>;
		const found = articles.find((a) => a.id === sharedArticleId);
		expect(found?.is_liked).toBe(true);

		// Annuler le like pour ne pas polluer les tests suivants
		await app.inject({
			method: "POST",
			url: `/articles/${sharedArticleId}/like`,
			headers: { authorization: `Bearer ${userToken}` },
		});
	});

	// ─────────────────────────────────────────────
	// GET /articles/:id
	// ─────────────────────────────────────────────

	it("should increment view_count on each GET /:id", async () => {
		const res1 = await app.inject({ method: "GET", url: `/articles/${sharedArticleId}` });
		const view1 = JSON.parse(res1.payload).view_count;

		const res2 = await app.inject({ method: "GET", url: `/articles/${sharedArticleId}` });
		const view2 = JSON.parse(res2.payload).view_count;

		expect(view2).toBe(view1 + 1);
	});

	it("should return 404 for a non-existent article", async () => {
		const res = await app.inject({ method: "GET", url: "/articles/999999" });
		expect(res.statusCode).toBe(404);
	});

	// ─────────────────────────────────────────────
	// POST /articles (admin uniquement)
	// ─────────────────────────────────────────────

	it("should create an article as admin (201)", async () => {
		const res = await app.inject({
			method: "POST",
			url: "/articles",
			headers: { authorization: `Bearer ${adminToken}` },
			payload: { title: "[TEST] Created by Admin", content: "Contenu valide." },
		});
		expect(res.statusCode).toBe(201);
		const body = JSON.parse(res.payload);
		expect(body.title).toBe("[TEST] Created by Admin");
		expect(body.id).toBeDefined();
	});

	it("should refuse article creation as regular user (403)", async () => {
		const res = await app.inject({
			method: "POST",
			url: "/articles",
			headers: { authorization: `Bearer ${userToken}` },
			payload: { title: "[TEST] Forbidden", content: "Ne doit pas passer." },
		});
		expect(res.statusCode).toBe(403);
	});

	it("should refuse article creation without token (401)", async () => {
		const res = await app.inject({
			method: "POST",
			url: "/articles",
			payload: { title: "[TEST] No auth", content: "Ne doit pas passer." },
		});
		expect(res.statusCode).toBe(401);
	});

	// ─────────────────────────────────────────────
	// PUT /articles/:id (auteur uniquement)
	// ─────────────────────────────────────────────

	it("should update an article as its author (200)", async () => {
		const res = await app.inject({
			method: "PUT",
			url: `/articles/${sharedArticleId}`,
			headers: { authorization: `Bearer ${adminToken}` },
			payload: { title: "[TEST] Updated Title", content: "Contenu mis à jour." },
		});
		expect(res.statusCode).toBe(200);
		expect(JSON.parse(res.payload).title).toBe("[TEST] Updated Title");
	});

	it("should refuse update by a non-author (403)", async () => {
		const res = await app.inject({
			method: "PUT",
			url: `/articles/${sharedArticleId}`,
			headers: { authorization: `Bearer ${userToken}` },
			payload: { title: "[TEST] Hack", content: "Ne doit pas passer." },
		});
		expect(res.statusCode).toBe(403);
	});

	it("should return 404 when updating a non-existent article", async () => {
		const res = await app.inject({
			method: "PUT",
			url: "/articles/999999",
			headers: { authorization: `Bearer ${adminToken}` },
			payload: { title: "[TEST] Ghost", content: "N'existe pas." },
		});
		expect(res.statusCode).toBe(404);
	});

	// ─────────────────────────────────────────────
	// POST /articles/:id/like (toggle)
	// ─────────────────────────────────────────────

	it("should like an article and increment like_count", async () => {
		const before = JSON.parse(
			(await app.inject({ method: "GET", url: `/articles/${sharedArticleId}` })).payload,
		).like_count;

		const res = await app.inject({
			method: "POST",
			url: `/articles/${sharedArticleId}/like`,
			headers: { authorization: `Bearer ${userToken}` },
		});
		expect(res.statusCode).toBe(200);
		expect(JSON.parse(res.payload).like_count).toBe(before + 1);
	});

	it("should unlike on second call and decrement like_count", async () => {
		const before = JSON.parse(
			(await app.inject({ method: "GET", url: `/articles/${sharedArticleId}` })).payload,
		).like_count;

		const res = await app.inject({
			method: "POST",
			url: `/articles/${sharedArticleId}/like`,
			headers: { authorization: `Bearer ${userToken}` },
		});
		expect(res.statusCode).toBe(200);
		expect(JSON.parse(res.payload).like_count).toBe(before - 1);
	});

	it("should refuse like without authentication (401)", async () => {
		const res = await app.inject({
			method: "POST",
			url: `/articles/${sharedArticleId}/like`,
		});
		expect(res.statusCode).toBe(401);
	});

	// ─────────────────────────────────────────────
	// DELETE /articles/:id (admin uniquement)
	// ─────────────────────────────────────────────

	it("should refuse deletion as regular user (403)", async () => {
		const res = await app.inject({
			method: "DELETE",
			url: `/articles/${sharedArticleId}`,
			headers: { authorization: `Bearer ${userToken}` },
		});
		expect(res.statusCode).toBe(403);
	});

	it("should delete an article as admin (200) and confirm 404 after", async () => {
		// Crée un article jetable pour ce test
		const created = await app.inject({
			method: "POST",
			url: "/articles",
			headers: { authorization: `Bearer ${adminToken}` },
			payload: { title: "[TEST] To Delete", content: "Sera supprimé." },
		});
		const { id } = JSON.parse(created.payload);

		const del = await app.inject({
			method: "DELETE",
			url: `/articles/${id}`,
			headers: { authorization: `Bearer ${adminToken}` },
		});
		expect(del.statusCode).toBe(200);

		// Confirmation : l'article n'existe plus
		const check = await app.inject({ method: "GET", url: `/articles/${id}` });
		expect(check.statusCode).toBe(404);
	});
});
