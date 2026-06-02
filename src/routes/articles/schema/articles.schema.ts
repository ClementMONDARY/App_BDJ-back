import { z } from "zod";

export const ZArticle = z.object({
	id: z.number().int(),
	author_id: z.number().int(),
	title: z.string().min(1),
	content: z.string().min(1),
	cover_image: z.string().nullable(),
	view_count: z.number().int().default(0),
	like_count: z.number().int().default(0),
	is_liked: z.boolean().optional(),
	created_at: z.date(),
	updated_at: z.date(),
});

export const ZNewArticle = z.object({
	title: z.string().min(1),
	content: z.string().min(1),
	cover_image: z.string().optional(),
});

export const ZArticleList = z.array(ZArticle);

export type Article = z.infer<typeof ZArticle>;
export type NewArticle = z.infer<typeof ZNewArticle>;
