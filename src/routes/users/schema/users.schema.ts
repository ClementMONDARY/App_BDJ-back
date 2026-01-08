import { z } from "zod";

export const ZPublicProfile = z.object({
	id: z.uuid(),
	username: z.string(),
	avatar: z.string().nullable(),
	bio: z.string().nullable(),
	created_at: z.date(),
	role: z.enum(["user", "admin", "moderator"]),
});

export const ZUserProfileParams = z.object({
	id: z.uuid(),
});

export const ZUpdateUser = z.object({
	firstname: z.string().optional(),
	lastname: z.string().optional(),
	username: z.string().min(3).max(30).optional(),
	bio: z.string().optional(),
	avatar: z.string().optional(),
	email: z.email().optional(),
	password: z.string().min(8).optional(),
});

export type PublicProfile = z.infer<typeof ZPublicProfile>;
