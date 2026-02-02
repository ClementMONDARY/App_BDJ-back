import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import sql from "../../db/db.js";
import { authenticate, requireRole } from "../../plugins/auth.js";
import { createNotification } from "../../services/notifications.service.js";
import {
	type Article,
	ZArticle,
	ZArticleList,
	ZNewArticle,
	ZUpdateArticle,
} from "./schema/articles.schema.js";

export default async function articlesRoutes(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		"/",
		{
			schema: {
				response: {
					200: ZArticleList,
				},
			},
		},
		async (_request, reply) => {
			const articles = await sql<Article[]>`
                SELECT * FROM articles
                ORDER BY created_at DESC
            `;

			return reply.send(articles);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().get(
		"/:id",
		{
			schema: {
				params: z.object({
					id: z.coerce.number().int(),
				}),
				response: {
					200: ZArticle,
					404: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;

			// Increment view count side-effect (could be optimized)
			await sql`
                UPDATE articles SET view_count = view_count + 1 WHERE id = ${id}
            `;

			const [article] = await sql<Article[]>`
                SELECT * FROM articles WHERE id = ${id}
            `;

			if (!article) {
				return reply.status(404).send({ message: "Article not found" });
			}

			return reply.send(article);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().post(
		"/",
		{
			preHandler: [authenticate, requireRole(["admin", "moderator"])],
			schema: {
				body: ZNewArticle,
				response: {
					201: ZArticle,
				},
			},
		},
		async (request, reply) => {
			const { title, content, cover_image } = request.body;
			const userId = request.user.id;

			const [article] = await sql<Article[]>`
                INSERT INTO articles (author_id, title, content, cover_image)
                VALUES (${userId}, ${title}, ${content}, ${cover_image || null})
                RETURNING *
            `;

			return reply.status(201).send(article);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().put(
		"/:id",
		{
			preHandler: [authenticate],
			schema: {
				params: z.object({
					id: z.coerce.number().int(),
				}),
				body: ZUpdateArticle,
				response: {
					200: ZArticle,
					403: z.object({
						message: z.string(),
					}),
					404: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const userId = request.user.id;

			// Check ownership
			const [existing] =
				await sql`SELECT author_id FROM articles WHERE id = ${id}`;
			if (!existing)
				return reply.status(404).send({ message: "Article not found" });
			if (existing.author_id !== userId)
				return reply
					.status(403)
					.send({ message: "You are not the author of this article" });

			const [article] = await sql<Article[]>`
                UPDATE articles
                SET ${sql(request.body as object)}, updated_at = NOW()
                WHERE id = ${id}
                RETURNING *
            `;

			return reply.send(article);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().delete(
		"/:id",
		{
			preHandler: [authenticate],
			schema: {
				params: z.object({
					id: z.coerce.number().int(),
				}),
				response: {
					200: z.object({
						message: z.string(),
					}),
					403: z.object({
						message: z.string(),
					}),
					404: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const userId = request.user.id;

			const [existing] =
				await sql`SELECT author_id FROM articles WHERE id = ${id}`;
			if (!existing)
				return reply.status(404).send({ message: "Article not found" });
			if (existing.author_id !== userId)
				return reply
					.status(403)
					.send({ message: "You are not the author of this article" });

			await sql`
                DELETE FROM articles WHERE id = ${id}
            `;

			return reply.status(200).send({ message: `Article deleted` });
		},
	);

	app.withTypeProvider<ZodTypeProvider>().post(
		"/:id/like",
		{
			preHandler: [authenticate],
			schema: {
				params: z.object({
					id: z.coerce.number().int(),
				}),
				response: {
					200: z.object({ like_count: z.number() }),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const userId = request.user.id;

			// Toggle like
			const [existingLike] = await sql`
                SELECT * FROM article_likes WHERE user_id = ${userId} AND article_id = ${id}
            `;

			if (existingLike) {
				await sql.begin(async (sql) => {
					await sql`DELETE FROM article_likes WHERE user_id = ${userId} AND article_id = ${id}`;
					await sql`UPDATE articles SET like_count = like_count - 1 WHERE id = ${id}`;
				});
			} else {
				await sql.begin(async (sql) => {
					await sql`INSERT INTO article_likes (user_id, article_id) VALUES (${userId}, ${id})`;
					await sql`UPDATE articles SET like_count = like_count + 1 WHERE id = ${id}`;

					const [article] = await sql<
						Article[]
					>`SELECT author_id, title FROM articles WHERE id = ${id}`;
					if (article?.author_id && article.author_id !== userId) {
						await createNotification({
							userId: article.author_id,
							type: "like",
							title: `New like on "${article.title}"`,
							content: `${request.user.username} liked your article.`,
							resourceData: { article_id: id },
							sqlTransaction: sql,
							ensureUnique: true,
						});
					}
				});
			}

			const [updatedArticle] =
				await sql`SELECT like_count FROM articles WHERE id = ${id}`;
			return reply.send({ like_count: updatedArticle.like_count });
		},
	);
}
