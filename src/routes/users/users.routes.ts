import fs from "node:fs/promises";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import sql from "../../db/db.js";
import { authenticate, hashPassword } from "../../plugins/auth.js";
import {
	type PublicProfile,
	type UserPreview,
	ZPublicProfile,
	ZUpdateUser,
	ZUserList,
	ZUserProfileParams,
} from "./schema/users.schema.js";

export default async function usersRoutes(app: FastifyInstance) {
	// Get User
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
                SELECT id, username, avatar, bio, role, follower_count, following_count, created_at
                FROM users
                WHERE id = ${id}
            `;

			if (!user) {
				return reply.status(404).send();
			}

			return reply.send(user);
		},
	);

	// Update User
	app.withTypeProvider<ZodTypeProvider>().put(
		"/:id",
		{
			preHandler: [authenticate],
			schema: {
				params: ZUserProfileParams,
				body: ZUpdateUser,
				response: {
					200: ZPublicProfile,
					403: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
					409: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const { email, password, ...userFields } = request.body;

			if (request.user.id !== id) {
				return reply
					.status(403)
					.send({ message: "You can only update your own profile" });
			}

			let passwordHash: string | undefined;
			if (password) {
				passwordHash = await hashPassword(password);
			}

			try {
				const updatedUser = await sql.begin(async (sql) => {
					let user: PublicProfile | undefined;

					if (email || passwordHash) {
						const updateAuth = {
							...(email && { email }),
							...(passwordHash && { password_hash: passwordHash }),
						};
						await sql`
                            UPDATE user_auth 
                            SET ${sql(updateAuth)}
                            WHERE user_id = ${id}
                        `;
					}

					if (Object.keys(userFields).length > 0) {
						[user] = await sql<PublicProfile[]>`
                            UPDATE users
                            SET ${sql(userFields)}
                            WHERE id = ${id}
                            RETURNING id, username, avatar, bio, role, follower_count, following_count, created_at
                        `;
					} else {
						[user] = await sql<PublicProfile[]>`
                            SELECT id, username, avatar, bio, role, follower_count, following_count, created_at
                            FROM users
                            WHERE id = ${id}
                        `;
					}

					return user;
				});

				if (!updatedUser) {
					return reply.status(404).send({ message: "User not found" });
				}

				return reply.send(updatedUser);
			} catch (err: unknown) {
				if (typeof err === "object" && err !== null && "code" in err) {
					if (err.code === "23505") {
						return reply
							.status(409)
							.send({ message: "Username or email already taken" });
					}
				}
				throw err;
			}
		},
	);

	// Delete User
	app.withTypeProvider<ZodTypeProvider>().delete(
		"/:id",
		{
			preHandler: [authenticate],
			schema: {
				params: ZUserProfileParams,
				response: {
					200: z.object({ message: z.string() }),
					403: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;

			if (request.user.id !== id) {
				return reply
					.status(403)
					.send({ message: "You can only delete your own account" });
			}

			const [user] = await sql<PublicProfile[]>`
        SELECT avatar FROM users WHERE id = ${id}
      `;

			if (user?.avatar && user.avatar.includes("/uploads/avatars/")) {
				try {
					const uploadDir = path.join(process.cwd(), "uploads", "avatars");
					const filename = path.basename(user.avatar);
					const filepath = path.join(uploadDir, filename);
					await fs.unlink(filepath);
				} catch (err) {
					console.error("Failed to delete user avatar:", err);
				}
			}

			await sql`
                DELETE FROM users WHERE id = ${id}
            `;

			return reply.send({ message: "Account deleted successfully" });
		},
	);

	// Upload Avatar
	app.withTypeProvider<ZodTypeProvider>().post(
		"/me/avatar",
		{
			preHandler: [authenticate],
			schema: {
				response: {
					200: z.object({ message: z.string() }),
					400: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const data = await request.file();

			if (!data) {
				return reply.status(400).send({ message: "No file uploaded" });
			}

			const allowedMimeTypes = [
				"image/png",
				"image/jpeg",
				"image/jpg",
				"image/webp",
			];
			if (!allowedMimeTypes.includes(data.mimetype)) {
				return reply.status(400).send({ message: "Invalid file type" });
			}

			const user = request.user;
			const extension = path.extname(data.filename);
			const filename = `user-${user.id}-${Date.now()}${extension}`;
			const uploadDir = path.join(process.cwd(), "uploads", "avatars");
			const filepath = path.join(uploadDir, filename);

			await fs.mkdir(uploadDir, { recursive: true });

			await fs.writeFile(filepath, await data.toBuffer());
			const baseUrl =
				process.env.BASE_URL || `${request.protocol}://${request.hostname}`;
			const avatarUrl = `${baseUrl}/uploads/avatars/${filename}`;

			const [oldUser] = await sql<PublicProfile[]>`
        SELECT avatar FROM users WHERE id = ${user.id}
      `;

			await sql`
        UPDATE users SET avatar = ${avatarUrl} WHERE id = ${user.id}
      `;

			if (oldUser?.avatar && oldUser.avatar.includes("/uploads/avatars/")) {
				try {
					const oldFilename = path.basename(oldUser.avatar);
					const oldFilepath = path.join(uploadDir, oldFilename);
					await fs.unlink(oldFilepath);
				} catch (err) {
					console.error("Failed to delete old avatar:", err);
				}
			}

			return reply
				.status(200)
				.send({ message: "Avatar uploaded successfully" });
		},
	);

	// Follow User
	app.withTypeProvider<ZodTypeProvider>().post(
		"/:id/follow",
		{
			preHandler: [authenticate],
			schema: {
				params: ZUserProfileParams,
				response: {
					200: z.object({ message: z.string() }),
					400: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
					409: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const { id: targetId } = request.params;
			const actorId = request.user.id;

			if (actorId === targetId) {
				return reply
					.status(400)
					.send({ message: "You cannot follow yourself" });
			}

			try {
				await sql.begin(async (sql) => {
					// Check if target user exists
					const [target] =
						await sql`SELECT 1 FROM users WHERE id = ${targetId}`;
					if (!target) {
						throw new Error("User not found");
					}

					// Insert follow
					await sql`
                        INSERT INTO user_follows (follower_id, following_id)
                        VALUES (${actorId}, ${targetId})
                    `;

					// Update counts
					await sql`
                        UPDATE users SET following_count = following_count + 1 WHERE id = ${actorId}
                    `;
					await sql`
                        UPDATE users SET follower_count = follower_count + 1 WHERE id = ${targetId}
                    `;
				});

				return reply.send({ message: "Followed successfully" });
			} catch (err: unknown) {
				if (err instanceof Error && err.message === "User not found") {
					return reply.status(404).send({ message: "User not found" });
				}
				if (typeof err === "object" && err !== null && "code" in err) {
					if (err.code === "23505") {
						return reply.status(409).send({ message: "Already following" });
					}
				}
				throw err;
			}
		},
	);

	// Unfollow User
	app.withTypeProvider<ZodTypeProvider>().delete(
		"/:id/follow",
		{
			preHandler: [authenticate],
			schema: {
				params: ZUserProfileParams,
				response: {
					200: z.object({ message: z.string() }),
					400: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const { id: targetId } = request.params;
			const actorId = request.user.id;

			if (actorId === targetId) {
				return reply
					.status(400)
					.send({ message: "You cannot unfollow yourself" });
			}

			try {
				await sql.begin(async (sql) => {
					// Delete follow
					const [deleted] = await sql`
                        DELETE FROM user_follows 
                        WHERE follower_id = ${actorId} AND following_id = ${targetId}
                        RETURNING *
                    `;

					if (!deleted) {
						throw new Error("Not following");
					}

					// Update counts
					await sql`
                        UPDATE users SET following_count = following_count - 1 WHERE id = ${actorId}
                    `;
					await sql`
                        UPDATE users SET follower_count = follower_count - 1 WHERE id = ${targetId}
                    `;
				});

				return reply.send({ message: "Unfollowed successfully" });
			} catch (err: unknown) {
				if (err instanceof Error && err.message === "Not following") {
					return reply.status(404).send({ message: "Not following" });
				}
				throw err;
			}
		},
	);

	// Get Followers
	app.withTypeProvider<ZodTypeProvider>().get(
		"/:id/followers",
		{
			schema: {
				params: ZUserProfileParams,
				response: {
					200: ZUserList,
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;

			const followers = await sql<UserPreview[]>`
                SELECT u.id, u.username, u.avatar
                FROM user_follows uf
                JOIN users u ON u.id = uf.follower_id
                WHERE uf.following_id = ${id}
            `;

			return reply.send(followers);
		},
	);

	// Get Following
	app.withTypeProvider<ZodTypeProvider>().get(
		"/:id/following",
		{
			schema: {
				params: ZUserProfileParams,
				response: {
					200: ZUserList,
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;

			const following = await sql<UserPreview[]>`
                SELECT u.id, u.username, u.avatar
                FROM user_follows uf
                JOIN users u ON u.id = uf.following_id
                WHERE uf.follower_id = ${id}
            `;

			return reply.send(following);
		},
	);
}
