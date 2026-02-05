import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import sql from "../../db/db.js";
import { authenticate } from "../../plugins/auth.js";
import {
	Notification,
	ZNotificationList,
} from "./schema/notifications.schema.js";

export default async function notificationsRoutes(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		"/",
		{
			preHandler: [authenticate],
			schema: {
				response: {
					200: ZNotificationList,
				},
			},
		},
		async (request, reply) => {
			const userId = request.user.id;
			const notifications = await sql<Notification[]>`
                SELECT * FROM notifications
                WHERE user_id = ${userId}
                ORDER BY created_at DESC
            `;
			return reply.send(notifications);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().patch(
		"/:id/read",
		{
			preHandler: [authenticate],
			schema: {
				params: z.object({
					id: z.coerce.number().int(),
				}),
				response: {
					204: z.null(),
					404: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const userId = request.user.id;

			const result = await sql`
                UPDATE notifications
                SET is_read = TRUE
                WHERE id = ${id} AND user_id = ${userId}
            `;

			if (result.count === 0) {
				return reply.status(404).send({ message: "Notification not found" });
			}

			return reply.status(204).send();
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
					404: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const userId = request.user.id;

			const [notification] = await sql<Notification[]>`
                DELETE FROM notifications
                WHERE id = ${id} AND user_id = ${userId}
                RETURNING *
            `;

			if (!notification) {
				return reply.status(404).send({ message: "Notification not found" });
			}

			return reply.send({ message: "Notification deleted" });
		},
	);
}
