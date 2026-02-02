import { z } from "zod";

export const ZStatus = z.enum(["pending", "answered", "rejected"]);

export const ZQuestion = z.object({
	id: z.number().int(),
	user_id: z.number().int(),
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

// Public schema
// --------------------------------------------
export const ZUserNewQuestion = ZQuestion.pick({
	message: true,
});
const ZPublicQuestion = ZQuestion.pick({
	message: true,
	answer: true,
});
export const ZPublicQuestionList = ZPublicQuestion.array();

// Types
export type Question = z.infer<typeof ZQuestion>;
export type PublicQuestion = z.infer<typeof ZPublicQuestion>;
