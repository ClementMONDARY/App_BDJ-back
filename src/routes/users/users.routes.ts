import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import sql from "../../db/db.js";
import {
	type PublicProfile,
	ZPublicProfile,
	ZUserProfileParams,
} from "./schema/users.schema.js";

export default async function usersRoutes(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		"/:id",
		{
			schema: {
				params: ZUserProfileParams,
				response: {
					200: ZPublicProfile,
					404: z.null(),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;

			const [user] = await sql<PublicProfile[]>`
                SELECT id, username, avatar, bio, role,created_at
                FROM users
                WHERE id = ${id}
            `;

			if (!user) {
				return reply.status(404).send();
			}

			return reply.send(user);
		},
	);
}
