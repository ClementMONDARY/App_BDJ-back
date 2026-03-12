import { z } from "zod";

export const ZTopic = z.object({
	id: z.number().int(),
	author_id: z.number().int().nullable(),
	title: z.string(),
	content: z.string().nullable(),
	cover_image: z.string().nullable(),
	attachment_urls: z.array(z.string()).nullable(),
	view_count: z.number().int(),
	like_count: z.number().int(),
	msg_count: z.number().int(),
	created_at: z.date(),
	updated_at: z.date(),
});

export const ZPost = z.object({
	id: z.number().int(),
	topic_id: z.number().int(),
	author_id: z.number().int().nullable(),
	content: z.string(),
	parent_id: z.number().int().nullable(),
	created_at: z.date(),
	updated_at: z.date(),
});

// Inputs
export const ZNewTopic = z.object({
	title: z.string().min(1),
	content: z.string().min(1),
	cover_image: z.string().optional(),
	attachment_urls: z.array(z.string()).max(5).optional(),
});

export const ZNewPost = z.object({
	content: z.string().min(1),
	parent_id: z.number().int().optional(),
});

// Lists
export const ZTopicList = z.array(ZTopic);
export const ZPostList = z.array(ZPost);

export type Topic = z.infer<typeof ZTopic>;
export type Post = z.infer<typeof ZPost>;

export const ZTopicMessagersResponse = z.object({
	users_ids: z.array(z.number().int()),
});
