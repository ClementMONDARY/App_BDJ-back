import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import sql from "../../db/db.js";
import { authenticate, requireRole } from "../../plugins/auth.js";
import {
	createNotification,
	notifyAllUsers,
} from "../../services/notifications.service.js";
import {
	type Event,
	type Registration,
	ZEvent,
	ZEventList,
	ZNewEvent,
	ZRegistration,
} from "./schema/events.schema.js";

export default async function eventsRoutes(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		"/",
		{
			schema: {
				response: {
					200: ZEventList,
				},
			},
		},
		async (_request, reply) => {
			const events = await sql<Event[]>`
                SELECT * FROM events
                ORDER BY start_time ASC
            `;
			return reply.send(events);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().get(
		"/:id",
		{
			schema: {
				params: z.object({ id: z.coerce.number().int() }),
				response: {
					200: ZEvent,
					404: z.null(),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const [event] = await sql<Event[]>`
                SELECT * FROM events WHERE id = ${id}
            `;
			if (!event) return reply.status(404).send();
			return reply.send(event);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().post(
		"/",
		{
			preHandler: [authenticate, requireRole(["admin"])],
			schema: {
				body: ZNewEvent,
				response: {
					201: ZEvent,
				},
			},
		},
		async (request, reply) => {
			const userId = request.user.id;
			const {
				title,
				description,
				cover_image,
				start_time,
				end_time,
				location,
				price,
				max_capacity,
			} = request.body;

			const [event] = await sql<Event[]>`
                INSERT INTO events (organizer_id, title, description, cover_image, start_time, end_time, location, price, max_capacity)
                VALUES (${userId}, ${title}, ${description}, ${cover_image || null}, ${start_time}, ${end_time}, ${location}, ${price || 0}, ${max_capacity || null})
                RETURNING *
            `;

			await notifyAllUsers({
				type: "event",
				title: `New Event: ${event.title}`,
				content: `A new event "${event.title}" has been created. Check it out!`,
				resourceData: { event_id: event.id },
				excludeUserId: userId,
			});

			return reply.status(201).send(event);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().post(
		"/:id/register",
		{
			preHandler: [authenticate],
			schema: {
				params: z.object({
					id: z.coerce.number().int(),
				}),
				response: {
					200: ZRegistration,
					404: z.null(),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const userId = request.user.id;

			// Ensure event exists
			const [event] = await sql<Event[]>`SELECT * FROM events WHERE id = ${id}`;
			if (!event) return reply.status(404).send();

			// Check if already registered
			const [existing] = await sql<Registration[]>`
                SELECT * FROM event_registrations WHERE event_id = ${id} AND user_id = ${userId}
             `;
			if (existing) {
				return reply.send(existing);
			}

			// Register transaction: insert + increment attendees
			const registration = await sql.begin(async (sql) => {
				const [reg] = await sql<Registration[]>`
                    INSERT INTO event_registrations (event_id, user_id, status)
                    VALUES (${id}, ${userId}, 'registered')
                    RETURNING *
                 `;

				await sql`UPDATE events SET current_attendees = current_attendees + 1 WHERE id = ${id}`;
				createNotification({
					userId,
					type: "event",
					title: `Évenement • Inscription à ${event.title}`,
					content: `Vous avez été inscrit à l'événement "${event.title}".`,
					resourceData: { event_id: event.id },
					sqlTransaction: sql,
				});

				return reg;
			});

			return reply.send(registration);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().delete(
		"/:id/register",
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
					404: z.null(),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const userId = request.user.id;

			const [existing] = await sql<Registration[]>`
                SELECT * FROM event_registrations WHERE event_id = ${id} AND user_id = ${userId}
             `;
			if (!existing) return reply.status(404).send();

			await sql.begin(async (sql) => {
				await sql`DELETE FROM event_registrations WHERE event_id = ${id} AND user_id = ${userId}`;
				await sql`UPDATE events SET current_attendees = current_attendees - 1 WHERE id = ${id}`;
			});

			return reply.status(200).send({ message: "Unregistered from event" });
		},
	);
}
