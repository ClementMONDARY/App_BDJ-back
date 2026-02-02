import { z } from "zod";

// CRUD schema
// --------------------------------------------
export const ZSuggestion = z.object({
	id: z.number().int(),
	user_id: z.number().int(),
	title: z.string().max(255),
	content: z.string().max(1000),
	upvotes: z.number().default(0),
	downvotes: z.number().default(0),
	created_at: z.date(),
});

// CRUD schema
// --------------------------------------------
export const ZNewSuggestion = ZSuggestion.omit({
	id: true,
	created_at: true,
});
export const ZPartialSuggestion = ZSuggestion.omit({
	id: true,
	created_at: true,
}).partial();
export const ZListSuggestions = ZSuggestion.array();

// Public schema
// --------------------------------------------
export const ZUserNewSuggestion = ZSuggestion.pick({
	title: true,
	content: true,
});
export const ZEnrichedSuggestion = ZSuggestion.extend({
	user_vote: z.enum(["up", "down"]).nullable().optional(),
});
export const ZSuggestionList = ZEnrichedSuggestion.array();
export const ZVoteSuggestionResponse = z.object({
	message: z.string(),
	new_upvotes: z.number(),
	new_downvotes: z.number(),
});

// Types
export type Suggestion = z.infer<typeof ZSuggestion>;
