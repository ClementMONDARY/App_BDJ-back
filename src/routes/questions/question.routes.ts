import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import sql from "../../db/db.js";
import { authenticate, requireRole } from "../../plugins/auth.js";
import {
	type Question,
	type PublicQuestion,
	ZQuestion,
	ZListQuestions,
	ZPartialQuestion,
	ZUserNewQuestion,
	ZPublicQuestionList,
	ZNewQuestion,
} from "./schema/questions.schema.js";

export default async function questionsRoutes(app: FastifyInstance) {
	// --------------------------------------------
	// CRUD
	// --------------------------------------------
	app.withTypeProvider<ZodTypeProvider>().post(
		"/",
		{
			preHandler: [authenticate, requireRole(["admin"])],
			schema: {
				body: ZNewQuestion,
				response: {
					201: ZQuestion,
				},
			},
		},
		async (request, reply) => {
			const { user_id, message, answer, status } = request.body;

			const Question = await sql.begin(async (sql) => {
				const [question] = await sql<Question[]>`   
                    INSERT INTO questions (user_id, message, answer, status)
                    VALUES (${user_id}, ${message}, ${answer}, ${status})
                    RETURNING *
                `;

				return question;
			});

			return reply.status(201).send(Question);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().get(
		"/",
		{
			preHandler: [authenticate, requireRole(["admin"])],
			schema: {
				response: {
					200: ZListQuestions,
				},
			},
		},
		async (_, reply) => {
			const questions = await sql<Question[]>`
                SELECT * FROM questions
            `;

			return reply.status(200).send(questions);
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
					200: ZQuestion,
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const [question] = await sql<Question[]>`
                SELECT * FROM questions WHERE id = ${id}
            `;

			return reply.status(200).send(question);
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
				body: ZPartialQuestion,
				response: {
					200: ZQuestion,
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const [question] = await sql<Question[]>`
                UPDATE questions
                SET ${sql(request.body as object)}
                WHERE id = ${id}
                RETURNING *
            `;

			return reply.status(200).send(question);
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
                DELETE FROM questions WHERE id = ${id}
            `;

			return reply.status(200).send({ message: "Question deleted" });
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
				body: ZUserNewQuestion,
				response: {
					201: ZQuestion,
				},
			},
		},
		async (request, reply) => {
			const { message } = request.body;
			const userId = request.user.id;

			const NewQuestion = await sql.begin(async (sql) => {
				const [question] = await sql<Question[]>`
                    INSERT INTO questions (user_id, message)
                    VALUES (${userId}, ${message})
                    RETURNING *
                `;

				return question;
			});

			return reply.status(201).send(NewQuestion);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().get(
		"/public",
		{
			schema: {
				response: {
					200: ZPublicQuestionList,
				},
			},
		},
		async (_, reply) => {
			const Questions = await sql<PublicQuestion[]>`
                SELECT message, answer FROM questions WHERE status = 'answered'
            `;

			return reply.status(200).send(Questions);
		},
	);
}
