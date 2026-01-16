import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import sql from "../../db/db.js";
import { authenticate } from "../../plugins/auth.js";
import {
	ZTopic,
	ZTopicList,
	ZPost,
	ZPostList,
	ZNewTopic,
	ZNewPost,
	ZToggleLikeResponse,
	ZToggleFollowResponse,
	type Topic,
	type Post,
} from "./schema/forum.schema.js";
import {
	createNotification,
	notifyAllUsers,
} from "../../services/notifications.service.js";

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
		async (_request, reply) => {
			const topics = await sql<Topic[]>`
                SELECT * FROM topics
                ORDER BY created_at DESC
            `;
			return reply.send(topics);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().get(
		"/topics/:id",
		{
			schema: {
				params: z.object({
					id: z.string(),
				}),
				response: {
					200: ZTopic,
					404: z.null(),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;

			// Increment view count
			await sql`UPDATE topics SET view_count = view_count + 1 WHERE id = ${id}`;

			const [topic] = await sql<Topic[]>`
                SELECT * FROM topics WHERE id = ${id}
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
					id: z.uuid(),
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
					id: z.uuid(),
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
							title: "New reply to your post",
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

	// Like (Upvote Only) - Toggle
	app.withTypeProvider<ZodTypeProvider>().post(
		"/topics/:id/like",
		{
			preHandler: [authenticate],
			schema: {
				params: z.object({ id: z.uuid() }),
				response: {
					200: ZToggleLikeResponse,
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const userId = request.user.id;

			const result = await sql.begin(async (sql) => {
				const [existingLike] = await sql`
                    SELECT * FROM topic_likes WHERE topic_id = ${id} AND user_id = ${userId}
                `;

				let message = "";
				let likeDelta = 0;

				if (existingLike) {
					// Unlike
					await sql`DELETE FROM topic_likes WHERE topic_id = ${id} AND user_id = ${userId}`;
					likeDelta = -1;
					message = "Unliked";
				} else {
					// Like
					await sql`INSERT INTO topic_likes (topic_id, user_id) VALUES (${id}, ${userId})`;
					likeDelta = 1;
					message = "Liked";
				}

				const [updatedTopic] = await sql<Topic[]>`
                    UPDATE topics
                    SET like_count = like_count + ${likeDelta}
                    WHERE id = ${id}
                    RETURNING like_count, author_id, title
                `;

				if (
					likeDelta === 1 &&
					updatedTopic.author_id !== null &&
					updatedTopic.author_id !== userId
				) {
					await createNotification({
						userId: updatedTopic.author_id,
						type: "forum",
						title: `New like on "${updatedTopic.title}"`,
						content: `${request.user.username} liked your topic.`,
						resourceData: { topic_id: id },
						sqlTransaction: sql,
						ensureUnique: true,
					});
				}

				return { message, likes: updatedTopic.like_count };
			});

			return reply.send(result);
		},
	);

	// Follow - Toggle
	app.withTypeProvider<ZodTypeProvider>().post(
		"/topics/:id/follow",
		{
			preHandler: [authenticate],
			schema: {
				params: z.object({ id: z.uuid() }),
				response: {
					200: ZToggleFollowResponse,
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const userId = request.user.id;

			const result = await sql.begin(async (sql) => {
				const [existingFollow] = await sql`
                    SELECT * FROM topic_follows WHERE topic_id = ${id} AND user_id = ${userId}
                `;

				let message = "";
				let isFollowing = false;

				if (existingFollow) {
					await sql`DELETE FROM topic_follows WHERE topic_id = ${id} AND user_id = ${userId}`;
					message = "Unfollowed";
					isFollowing = false;
				} else {
					await sql`INSERT INTO topic_follows (topic_id, user_id) VALUES (${id}, ${userId})`;
					message = "Followed";
					isFollowing = true;
				}

				return { message, is_following: isFollowing };
			});

			return reply.send(result);
		},
	);
}
