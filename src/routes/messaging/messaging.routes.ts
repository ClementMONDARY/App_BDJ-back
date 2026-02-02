import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import sql from "../../db/db.js";
import { authenticate } from "../../plugins/auth.js";
import { createNotification } from "../../services/notifications.service.js";
import {
	type Conversation,
	type Message,
	ZConversation,
	ZConversationList,
	ZMessage,
	ZMessageList,
	ZNewConversation,
	ZNewMessage,
} from "./schema/messaging.schema.js";

export default async function messagingRoutes(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		"/",
		{
			preHandler: [authenticate],
			schema: {
				response: {
					200: ZConversationList,
				},
			},
		},
		async (request, reply) => {
			const userId = request.user.id;
			const conversations = await sql<Conversation[]>`
                SELECT c.* 
                FROM conversations c
                JOIN conversation_participants cp ON c.id = cp.conversation_id
                WHERE cp.user_id = ${userId}
                ORDER BY c.updated_at DESC
            `;
			return reply.send(conversations);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().post(
		"/",
		{
			preHandler: [authenticate],
			schema: {
				body: ZNewConversation,
				response: {
					201: ZConversation,
				},
			},
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { participant_ids, title } = request.body;

			// Current user + participants
			const allParticipants = Array.from(new Set([userId, ...participant_ids]));
			const conversation = await sql.begin(async (sql) => {
				let conversationTitle = title;

				// Generate title if missing
				if (!conversationTitle) {
					const users =
						await sql`SELECT username FROM users WHERE id IN ${sql(allParticipants)}`;
					conversationTitle = users.map((u) => u.username).join(", ");
				}

				const [conv] = await sql<Conversation[]>`
                    INSERT INTO conversations (title) VALUES (${conversationTitle}) RETURNING *
                `;
				for (const pid of participant_ids) {
					await createNotification({
						userId: pid,
						type: "messaging",
						title: "Added to conversation",
						content: `${request.user.username} added you to a conversation "${conv.title}"`,
						resourceData: { conversation_id: conv.id },
					});
				}
				for (const pid of allParticipants) {
					await sql`
                        INSERT INTO conversation_participants (conversation_id, user_id)
                        VALUES (${conv.id}, ${pid})
                    `;
				}

				return conv;
			});

			return reply.status(201).send(conversation);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().get(
		"/:id/messages",
		{
			preHandler: [authenticate],
			schema: {
				params: z.object({ id: z.coerce.number().int() }),
				response: {
					200: ZMessageList,
					403: z.object({}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const userId = request.user.id;

			// Check access
			const [participant] = await sql`
                SELECT * FROM conversation_participants WHERE conversation_id = ${id} AND user_id = ${userId}
             `;
			if (!participant) return reply.status(403).send();

			const messages = await sql<Message[]>`
                SELECT * FROM messages WHERE conversation_id = ${id} ORDER BY created_at ASC
            `;
			return reply.send(messages);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().post(
		"/:id/messages",
		{
			preHandler: [authenticate],
			schema: {
				params: z.object({ id: z.coerce.number().int() }),
				body: ZNewMessage,
				response: {
					201: ZMessage,
					403: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const userId = request.user.id;
			const { content, attachment_urls } = request.body;

			// Check access
			const [participant] = await sql`
                SELECT * FROM conversation_participants WHERE conversation_id = ${id} AND user_id = ${userId}
             `;
			if (!participant) return reply.status(403).send({ message: "Forbidden" });

			const message = await sql.begin(async (sql) => {
				const [msg] = await sql<Message[]>`
                    INSERT INTO messages (conversation_id, sender_id, content, attachment_urls)
                    VALUES (${id}, ${userId}, ${content}, ${attachment_urls || null})
                    RETURNING *
                `;

				await sql`UPDATE conversations SET updated_at = NOW() WHERE id = ${id}`;

				// Notify other participants
				const participants = await sql`
                    SELECT user_id FROM conversation_participants 
                    WHERE conversation_id = ${id} AND user_id != ${userId}
                `;

				const [conv] =
					await sql`SELECT title FROM conversations WHERE id = ${id}`;

				for (const p of participants) {
					await createNotification({
						userId: p.user_id,
						type: "messaging",
						title: `New message in "${conv?.title || "Conversation"}"`,
						content: `${request.user.username}: ${content}`,
						resourceData: { conversation_id: id, message_id: msg.id },
						sqlTransaction: sql,
					});
				}

				return msg;
			});

			return reply.status(201).send(message);
		},
	);
}
