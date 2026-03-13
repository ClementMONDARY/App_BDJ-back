import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import sql from "../../db/db.js";
import { authenticate, verifyAccessToken } from "../../plugins/auth.js";
import {
	createNotification,
	notifyAllUsers,
} from "../../services/notifications.service.js";
import {
	type Post,
	type Topic,
	ZNewPost,
	ZNewTopic,
	ZPost,
	ZPostList,
	ZTopic,
	ZTopicList,
	ZTopicMessagersResponse,
} from "./schema/forum.schema.js";

export default async function forumRoutes(app: FastifyInstance) {
	// Topics
	app.withTypeProvider<ZodTypeProvider>().get(
		"/topics",
		{
			schema: {
				response: {
					200: ZTopicList,
				},
			},
		},
		async (request, reply) => {
			// Authentification optionnelle : on tente de décoder le JWT sans bloquer
			let userId: number | null = null;
			const authHeader = request.headers.authorization;
			if (authHeader?.startsWith("Bearer ")) {
				const token = authHeader.split(" ")[1];
				const user = await verifyAccessToken(token);
				if (user) userId = user.id;
			}

			const topics = await sql<Topic[]>`
				SELECT
					t.*,
					${userId !== null
						? sql`EXISTS(
							SELECT 1 FROM topic_follows
							WHERE topic_id = t.id AND user_id = ${userId}
						)`
						: sql`false`
					} AS is_followed
				FROM topics t
				ORDER BY t.created_at DESC
			`;
			return reply.send(topics);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().get(
		"/topics/:id",
		{
			schema: {
				params: z.object({
					id: z.coerce.number().int(),
				}),
				response: {
					200: ZTopic,
					404: z.null(),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;

			// Authentification optionnelle
			let userId: number | null = null;
			const authHeader = request.headers.authorization;
			if (authHeader?.startsWith("Bearer ")) {
				const token = authHeader.split(" ")[1];
				const user = await verifyAccessToken(token);
				if (user) userId = user.id;
			}

			// Increment view count
			await sql`UPDATE topics SET view_count = view_count + 1 WHERE id = ${id}`;

			const [topic] = await sql<Topic[]>`
				SELECT
					t.*,
					${userId !== null
						? sql`EXISTS(
							SELECT 1 FROM topic_follows
							WHERE topic_id = t.id AND user_id = ${userId}
						)`
						: sql`false`
					} AS is_followed
				FROM topics t
				WHERE t.id = ${id}
			`;

			if (!topic) return reply.status(404).send();
			return reply.send(topic);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().post(
		"/topics",
		{
			preHandler: [authenticate],
			schema: {
				body: ZNewTopic,
				response: {
					201: ZTopic,
				},
			},
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { title, content, cover_image, attachment_urls } = request.body;

			const topic = await sql.begin(async (sql) => {
				const [newTopic] = await sql<Topic[]>`
                    INSERT INTO topics (author_id, title, content, cover_image, attachment_urls)
                    VALUES (${userId}, ${title}, ${content}, ${cover_image || null}, ${attachment_urls || null})
                    RETURNING *
                `;
				await notifyAllUsers({
					type: "forum",
					title: `New topic: ${title}`,
					content: `${request.user.username} created a new topic named "${title}", are you interested?`,
					resourceData: { topic_id: newTopic.id },
					excludeUserId: userId,
					sqlTransaction: sql,
				});

				return newTopic;
			});

			return reply.status(201).send(topic);
		},
	);

	// Posts
	app.withTypeProvider<ZodTypeProvider>().get(
		"/topics/:id/posts",
		{
			schema: {
				params: z.object({
					id: z.coerce.number().int(),
				}),
				response: {
					200: ZPostList,
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const posts = await sql<Post[]>`
                SELECT * FROM posts WHERE topic_id = ${id} ORDER BY created_at ASC
            `;
			return reply.send(posts);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().post(
		"/topics/:id/posts",
		{
			preHandler: [authenticate],
			schema: {
				params: z.object({
					id: z.coerce.number().int(),
				}),
				body: ZNewPost,
				response: {
					201: ZPost,
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const userId = request.user.id;
			const { content, parent_id } = request.body;

			const post = await sql.begin(async (sql) => {
				const [newPost] = await sql<Post[]>`
                    INSERT INTO posts (topic_id, author_id, content, parent_id)
                    VALUES (${id}, ${userId}, ${content}, ${parent_id || null})
                    RETURNING *
                 `;

				await sql`UPDATE topics SET msg_count = msg_count + 1 WHERE id = ${id}`;

				// Notify parent post author (Reply to post)
				if (parent_id) {
					const [parentPost] = await sql<
						Post[]
					>`SELECT author_id FROM posts WHERE id = ${parent_id}`;
					const [topic] = await sql<
						Topic[]
					>`SELECT author_id, title FROM topics WHERE id = ${id}`;

					// If parent author is different from current user AND different from topic author (to avoid double notif)
					if (parentPost?.author_id && parentPost.author_id !== userId) {
						await createNotification({
							userId: parentPost.author_id,
							type: "forum",
							title: "Forum • New reply to your post",
							content: `${request.user.username} replied to your post in "${topic?.title}": ${content}`,
							resourceData: { topic_id: id, post_id: newPost.id },
							sqlTransaction: sql,
						});
					}
				}

				return newPost;
			});

			return reply.status(201).send(post);
		},
	);

	// Follow - Toggle
	app.withTypeProvider<ZodTypeProvider>().post(
		"/topics/:id/follow",
		{
			preHandler: [authenticate],
			schema: {
				params: z.object({ id: z.coerce.number().int() }),
				response: {
					204: z.null(),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const userId = request.user.id;

			await sql.begin(async (sql) => {
				const [existingFollow] = await sql`
                    SELECT * FROM topic_follows WHERE topic_id = ${id} AND user_id = ${userId}
                `;

				const likeDelta = existingFollow ? -1 : 1;

				if (existingFollow) {
					await sql`DELETE FROM topic_follows WHERE topic_id = ${id} AND user_id = ${userId}`;
				} else {
					await sql`INSERT INTO topic_follows (topic_id, user_id) VALUES (${id}, ${userId})`;
				}

				await sql`
                    UPDATE topics
                    SET like_count = like_count + ${likeDelta}
                    WHERE id = ${id}
                `;
			});

			return reply.status(204).send();
		},
	);

	// Topic Messagers
	app.withTypeProvider<ZodTypeProvider>().get(
		"/topics/:id/messagers",
		{
			schema: {
				params: z.object({ id: z.coerce.number().int() }),
				response: {
					200: ZTopicMessagersResponse,
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;

			const messagers = await sql<{ author_id: number }[]>`
				SELECT DISTINCT author_id 
				FROM posts 
				WHERE topic_id = ${id} AND author_id IS NOT NULL
			`;

			const users_ids = messagers.map((m) => m.author_id);

			return reply.send({ users_ids });
		},
	);
}
