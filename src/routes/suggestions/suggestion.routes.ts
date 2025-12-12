import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import sql from "../../db/db.js";
import { authenticate, requireRole } from "../../plugins/auth.js";
import {
	type Suggestion,
	type PublicSuggestion,
	ZSuggestion,
	ZListSuggestions,
	ZPartialSuggestion,
	ZUserNewSuggestion,
	ZPublicSuggestionList,
	ZVoteSuggestionResponse,
	ZNewSuggestion,
} from "./schema/suggestions.schema.js";

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
			const { user_id, title, content, vote_count } = request.body;

			const Suggestion = await sql.begin(async (sql) => {
				const [suggestion] = await sql<Suggestion[]>`   
                    INSERT INTO suggestions (user_id, title, content, vote_count)
                    VALUES (${user_id}, ${title}, ${content}, ${vote_count})
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
					200: ZPublicSuggestionList,
				},
			},
		},
		async (_request, reply) => {
			const suggestions = await sql<PublicSuggestion[]>`
                SELECT user_id,title, content, vote_count, created_at FROM suggestions
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

			const increment = type === "up" ? 1 : -1;

			const result = await sql.begin(async (sql) => {
				const [existingVote] = await sql`
                    SELECT id, type FROM suggestion_votes
                    WHERE suggestion_id = ${id} AND user_id = ${request.user.id}
                `;

				let message = "";
				let voteDelta = 0;

				// Scenario 1: New vote
				if (!existingVote) {
					await sql`
                        INSERT INTO suggestion_votes (suggestion_id, user_id, type)
                        VALUES (${id}, ${request.user.id}, ${type})
                    `;
					voteDelta = increment;
					message = `Suggestion ${type}voted`;

					// Scenario 2: Toggle vote
				} else if (existingVote.type === type) {
					await sql`
                        DELETE FROM suggestion_votes
                        WHERE id = ${existingVote.id}
                    `;
					voteDelta = -increment;
					message = "Vote removed";

					// Scenario 3: Switch vote
				} else {
					await sql`
                        UPDATE suggestion_votes
                        SET type = ${type}
                        WHERE id = ${existingVote.id}
                    `;
					voteDelta = increment * 2;
					message = "Vote switched";
				}

				const [updatedSuggestion] = await sql`
                    UPDATE suggestions
                    SET vote_count = vote_count + ${voteDelta}
                    WHERE id = ${id}
                    RETURNING vote_count
                `;

				return {
					vote_count: updatedSuggestion.vote_count,
					message,
				};
			});

			return reply.status(200).send({
				message: result.message,
				new_vote_count: result.vote_count,
			});
		},
	);
}
