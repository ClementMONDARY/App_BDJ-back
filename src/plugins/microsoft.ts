import { z } from "zod";

const microsoftUserSchema = z.object({
	id: z.string(),
	userPrincipalName: z.string().email().optional(),
	mail: z.string().email().optional().nullable(),
	givenName: z.string().optional().nullable(),
	surname: z.string().optional().nullable(),
});

export type MicrosoftUser = z.infer<typeof microsoftUserSchema>;

export async function verifyMicrosoftToken(
	token: string,
): Promise<MicrosoftUser> {
	const response = await fetch("https://graph.microsoft.com/v1.0/me", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to verify Microsoft token");
	}

	const data = await response.json();
	return microsoftUserSchema.parse(data);
}
