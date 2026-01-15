import { z } from "zod";

export const signupSchema = z.object({
	username: z.string().min(3).max(30),
	email: z.email(),
	password: z.string().min(8),
	firstname: z.string().optional(),
	lastname: z.string().optional(),
});

export const loginSchema = z.object({
	email: z.email(),
	password: z.string(),
});

export const userResponseSchema = z.object({
	id: z.uuid(),
	username: z.string(),
	email: z.email(),
	role: z.string(),
	firstname: z.string().nullable(),
	lastname: z.string().nullable(),
	created_at: z.date(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const messageResponseSchema = z.object({
	message: z.string(),
});

export const tokenResponseSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
});

export const refreshSchema = z.object({
	refreshToken: z.string(),
});

export const logoutSchema = z.object({
	refreshToken: z.string(),
});
