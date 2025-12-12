import { z } from "zod";

export const ZStatus = z.enum(["pending", "answered", "rejected"]);

export const ZQuestion = z.object({
	id: z.uuid(),
	user_id: z.uuid(),
	subject: z.string(),
	message: z.string().max(250),
	answer: z.string().nullable(),
	status: ZStatus.default("pending"),
	created_at: z.date(),
});

// CRUD schema
// --------------------------------------------
export const ZNewQuestion = ZQuestion.omit({
	id: true,
	created_at: true,
});
export const ZPartialQuestion = ZQuestion.omit({
	id: true,
	created_at: true,
}).partial();
export const ZListQuestions = ZQuestion.array();

// User schema
// --------------------------------------------
export const ZUserNewQuestion = ZQuestion.pick({
	subject: true,
	message: true,
});

// Public schema
// --------------------------------------------
export const ZPublicQuestion = ZQuestion.omit({
	id: true,
	user_id: true,
	status: true,
	created_at: true,
});

export const ZPublicQuestionList = ZPublicQuestion.array();

// Types
export type Question = z.infer<typeof ZQuestion>;
export type PublicQuestion = z.infer<typeof ZPublicQuestion>;
