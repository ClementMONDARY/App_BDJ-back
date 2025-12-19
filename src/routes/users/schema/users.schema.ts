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

export type PublicProfile = z.infer<typeof ZPublicProfile>;
