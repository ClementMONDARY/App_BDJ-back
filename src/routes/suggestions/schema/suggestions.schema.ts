import { z } from "zod";

// CRUD schema
// --------------------------------------------
export const ZSuggestion = z.object({
	id: z.uuid(),
	user_id: z.uuid(),
	title: z.string().max(255),
	content: z.string().max(1000),
	vote_count: z.number().default(0),
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
const ZPublicSuggestion = ZSuggestion.omit({
	id: true,
});
export const ZPublicSuggestionList = ZPublicSuggestion.array();
export const ZVoteSuggestionResponse = z.object({
	message: z.string(),
	new_vote_count: z.number(),
});

// Types
export type Suggestion = z.infer<typeof ZSuggestion>;
export type PublicSuggestion = z.infer<typeof ZPublicSuggestion>;
