import { z } from "zod";

export const ZArticle = z.object({
	id: z.uuid(),
	author_id: z.uuid(),
	title: z.string().min(1),
	content: z.string().min(1),
	cover_image: z.string().nullable(),
	view_count: z.number().int().default(0),
	like_count: z.number().int().default(0),
	created_at: z.date(),
	updated_at: z.date(),
});

export const ZNewArticle = z.object({
	title: z.string().min(1),
	content: z.string().min(1),
	cover_image: z.string().optional(),
});

export const ZUpdateArticle = z.object({
	title: z.string().min(1).optional(),
	content: z.string().min(1).optional(),
	cover_image: z.string().optional(),
});

export const ZArticleList = z.array(ZArticle);

export type Article = z.infer<typeof ZArticle>;
export type NewArticle = z.infer<typeof ZNewArticle>;
export type UpdateArticle = z.infer<typeof ZUpdateArticle>;
