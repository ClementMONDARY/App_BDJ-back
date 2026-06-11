import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import sql from "../../db/db.js";
import { authenticate, requireRole, verifyAccessToken } from "../../services/auth.service.js";
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
		async (request, reply) => {
			let userId: number | null = null;
			const authHeader = request.headers.authorization;
			if (authHeader?.startsWith("Bearer ")) {
				const token = authHeader.split(" ")[1];
				const user = await verifyAccessToken(token);
				if (user) userId = user.id;
			}

			const events = await sql<Event[]>`
                SELECT
                    e.*,
                    ${userId !== null
						? sql`EXISTS(
							SELECT 1 FROM event_registrations
							WHERE event_id = e.id AND user_id = ${userId}
						)`
						: sql`false`
					} AS is_registered
                FROM events e
                ORDER BY e.start_time ASC
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

			let userId: number | null = null;
			const authHeader = request.headers.authorization;
			if (authHeader?.startsWith("Bearer ")) {
				const token = authHeader.split(" ")[1];
				const user = await verifyAccessToken(token);
				if (user) userId = user.id;
			}

			const [event] = await sql<Event[]>`
                SELECT
                    e.*,
                    ${userId !== null
						? sql`EXISTS(
							SELECT 1 FROM event_registrations
							WHERE event_id = e.id AND user_id = ${userId}
						)`
						: sql`false`
					} AS is_registered
                FROM events e
                WHERE e.id = ${id}
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
					409: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const userId = request.user.id;

			const [existing] = await sql<Registration[]>`
                SELECT * FROM event_registrations WHERE event_id = ${id} AND user_id = ${userId}
             `;
			if (existing) {
				return reply.send(existing);
			}

			const registration = await sql.begin(async (sql) => {
				const [event] = await sql<Event[]>`
                    SELECT id, title, max_capacity, current_attendees FROM events WHERE id = ${id} FOR UPDATE
                `;
				if (!event) return null;
				if (event.max_capacity != null && event.current_attendees >= event.max_capacity) return "full";

				const [reg] = await sql<Registration[]>`
                    INSERT INTO event_registrations (event_id, user_id, status)
                    VALUES (${id}, ${userId}, 'registered')
                    RETURNING *
                 `;

				await sql`UPDATE events SET current_attendees = current_attendees + 1 WHERE id = ${id}`;
				createNotification({
					userId,
					type: "event",
					title: `Event • Registration to ${event.title}`,
					content: `You have been registered to the event "${event.title}".`,
					resourceData: { event_id: event.id },
					sqlTransaction: sql,
				});

				return reg;
			});

			if (registration === null) return reply.status(404).send();
			if (registration === "full") return reply.status(409).send({ message: "Event is full" });

			return reply.send(registration);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().put(
		"/:id",
		{
			preHandler: [authenticate, requireRole(["admin"])],
			schema: {
				params: z.object({ id: z.coerce.number().int() }),
				body: ZNewEvent,
				response: {
					200: ZEvent,
					404: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const { title, description, cover_image, start_time, end_time, location, price, max_capacity } = request.body;

			const [existing] = await sql`SELECT id FROM events WHERE id = ${id}`;
			if (!existing) return reply.status(404).send({ message: "Event not found" });

			const [event] = await sql<Event[]>`
                UPDATE events
                SET
                    title = ${title},
                    description = ${description},
                    cover_image = ${cover_image || null},
                    start_time = ${start_time},
                    end_time = ${end_time},
                    location = ${location},
                    price = ${price ?? 0},
                    max_capacity = ${max_capacity || null},
                    updated_at = NOW()
                WHERE id = ${id}
                RETURNING *
            `;

			return reply.send(event);
		},
	);

	app.withTypeProvider<ZodTypeProvider>().delete(
		"/:id",
		{
			preHandler: [authenticate, requireRole(["admin", "moderator"])],
			schema: {
				params: z.object({ id: z.coerce.number().int() }),
				response: {
					200: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;

			const [existing] = await sql`SELECT id FROM events WHERE id = ${id}`;
			if (!existing)
				return reply.status(404).send({ message: "Event not found" });

			await sql`DELETE FROM events WHERE id = ${id}`;

			return reply.status(200).send({ message: "Event deleted" });
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
