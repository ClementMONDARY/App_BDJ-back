import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import sql from "../../db/db.js";
import {
	authenticate,
	requireRole,
	verifyAccessToken,
} from "../../plugins/auth.js";
import {
	type Suggestion,
	ZSuggestion,
	ZListSuggestions,
	ZPartialSuggestion,
	ZUserNewSuggestion,
	ZVoteSuggestionResponse,
	ZNewSuggestion,
	ZSuggestionList,
} from "./schema/suggestions.schema.js";
import { createNotification } from "../../services/notifications.service.js";

export default async function suggestionsRoutes(app: FastifyInstance) {
	// --------------------------------------------
	// CRUD
	// --------------------------------------------
	app.withTypeProvider<ZodTypeProvider>().post(
		"/",
		{
			preHandler: [authenticate, requireRole(["admin"])],
			schema: {
				body: ZNewSuggestion,
				response: {
					201: ZSuggestion,
				},
			},
		},
		async (request, reply) => {
			const { user_id, title, content, upvotes, downvotes } = request.body;

			const Suggestion = await sql.begin(async (sql) => {
				const [suggestion] = await sql<Suggestion[]>`   
                    INSERT INTO suggestions (user_id, title, content, upvotes, downvotes)
                    VALUES (${user_id}, ${title}, ${content}, ${upvotes}, ${downvotes})
                    RETURNING *
                `;

				return suggestion;
			});

			return reply.status(201).send(Suggestion);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().get(
		"/",
		{
			preHandler: [authenticate, requireRole(["admin"])],
			schema: {
				response: {
					200: ZListSuggestions,
				},
			},
		},
		async (_request, reply) => {
			const Suggestions = await sql<Suggestion[]>`
                SELECT * FROM suggestions
            `;

			return reply.status(200).send(Suggestions);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().get(
		"/:id",
		{
			preHandler: [authenticate, requireRole(["admin"])],
			schema: {
				params: z.object({
					id: z.uuid(),
				}),
				response: {
					200: ZSuggestion,
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const [Suggestion] = await sql<Suggestion[]>`
                SELECT * FROM suggestions WHERE id = ${id}
            `;

			return reply.status(200).send(Suggestion);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().put(
		"/:id",
		{
			preHandler: [authenticate, requireRole(["admin"])],
			schema: {
				params: z.object({
					id: z.uuid(),
				}),
				body: ZPartialSuggestion,
				response: {
					200: ZSuggestion,
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const [Suggestion] = await sql<Suggestion[]>`
                UPDATE suggestions
                SET ${sql(request.body as object)}
                WHERE id = ${id}
                RETURNING *
            `;

			return reply.status(200).send(Suggestion);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().delete(
		"/:id",
		{
			preHandler: [authenticate, requireRole(["admin"])],
			schema: {
				params: z.object({
					id: z.uuid(),
				}),
				response: {
					200: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			await sql`
                DELETE FROM suggestions WHERE id = ${id}
            `;

			return reply.status(200).send({ message: "Suggestion deleted" });
		},
	);

	// --------------------------------------------
	// Public
	// --------------------------------------------
	app.withTypeProvider<ZodTypeProvider>().post(
		"/submit",
		{
			preHandler: [authenticate],
			schema: {
				body: ZUserNewSuggestion,
				response: {
					201: ZSuggestion,
				},
			},
		},
		async (request, reply) => {
			const { title, content } = request.body;
			const userId = request.user.id;

			const NewSuggestion = await sql.begin(async (sql) => {
				const [suggestion] = await sql<Suggestion[]>`
                    INSERT INTO suggestions (user_id, title, content)
                    VALUES (${userId}, ${title}, ${content})
                    RETURNING *
                `;

				return suggestion;
			});

			return reply.status(201).send(NewSuggestion);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().get(
		"/public",
		{
			schema: {
				response: {
					200: ZSuggestionList,
				},
			},
		},
		async (request, reply) => {
			const authHeader = request.headers.authorization;
			let userId: string | null = null;

			if (authHeader?.startsWith("Bearer ")) {
				const token = authHeader.split(" ")[1];
				const user = await verifyAccessToken(token);
				if (user) {
					userId = user.id;
				}
			}

			if (userId) {
				const suggestions = await sql<Suggestion[]>`
                    SELECT 
                        s.id, s.user_id, s.title, s.content, s.upvotes, s.downvotes, s.created_at,
                        v.type as user_vote
                    FROM suggestions s
                    LEFT JOIN suggestion_votes v ON s.id = v.suggestion_id AND v.user_id = ${userId}
                `;
				return reply.status(200).send(suggestions);
			}

			const suggestions = await sql<Suggestion[]>`
                SELECT *, NULL as user_vote FROM suggestions
            `;

			return reply.status(200).send(suggestions);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().post(
		"/:id/vote",
		{
			preHandler: [authenticate],
			schema: {
				params: z.object({
					id: z.uuid(),
				}),
				body: z.object({
					type: z.enum(["up", "down"]),
				}),
				response: {
					200: ZVoteSuggestionResponse,
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const { type } = request.body;

			const result = await sql.begin(async (sql) => {
				const [existingVote] = await sql`
                    SELECT id, type FROM suggestion_votes
                    WHERE suggestion_id = ${id} AND user_id = ${request.user.id}
                `;

				let message = "";
				let upvoteDelta = 0;
				let downvoteDelta = 0;

				// Scenario 1: New vote
				if (!existingVote) {
					await sql`
                        INSERT INTO suggestion_votes (suggestion_id, user_id, type)
                        VALUES (${id}, ${request.user.id}, ${type})
                    `;
					if (type === "up") upvoteDelta = 1;
					else downvoteDelta = 1;
					message = `Suggestion ${type}voted`;

					// Scenario 2: Toggle vote
				} else if (existingVote.type === type) {
					await sql`
                        DELETE FROM suggestion_votes
                        WHERE id = ${existingVote.id}
                    `;
					if (type === "up") upvoteDelta = -1;
					else downvoteDelta = -1;
					message = "Vote removed";

					// Scenario 3: Switch vote
				} else {
					await sql`
                        UPDATE suggestion_votes
                        SET type = ${type}
                        WHERE id = ${existingVote.id}
                    `;
					if (type === "up") {
						// Was down, now up
						downvoteDelta = -1;
						upvoteDelta = 1;
					} else {
						// Was up, now down
						upvoteDelta = -1;
						downvoteDelta = 1;
					}
					message = "Vote switched";
				}

				const [updatedSuggestion] = await sql`
                    UPDATE suggestions
                    SET 
                        upvotes = upvotes + ${upvoteDelta},
                        downvotes = downvotes + ${downvoteDelta}
                    WHERE id = ${id}
                    RETURNING user_id, title, upvotes, downvotes
                `;

				if (type === "up" && updatedSuggestion.user_id !== request.user.id) {
					await createNotification({
						userId: updatedSuggestion.user_id,
						type: "like",
						title: `Someone liked "${updatedSuggestion.title}"`,
						content: `${request.user.username} liked your suggestion.`,
						resourceData: { suggestion_id: id },
						sqlTransaction: sql,
						ensureUnique: true,
					});
				}

				return {
					upvotes: updatedSuggestion.upvotes,
					downvotes: updatedSuggestion.downvotes,
					message,
				};
			});

			return reply.status(200).send({
				message: result.message,
				new_upvotes: result.upvotes,
				new_downvotes: result.downvotes,
			});
		},
	);
}
