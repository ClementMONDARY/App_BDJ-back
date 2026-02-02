import { z } from "zod";

export const ZConversation = z.object({
	id: z.number().int(),
	title: z.string().nullable(),
	created_at: z.date(),
	updated_at: z.date(),
});

export const ZMessage = z.object({
	id: z.number().int(),
	conversation_id: z.number().int(),
	sender_id: z.number().int(),
	content: z.string(),
	attachment_urls: z.array(z.string()).nullable(),
	created_at: z.date(),
});

export const ZNewConversation = z.object({
	participant_ids: z.array(z.number().int()),
	title: z.string().optional(),
});

export const ZNewMessage = z.object({
	content: z.string().min(1),
	attachment_urls: z.array(z.string()).optional(),
});

export const ZConversationList = z.array(ZConversation);
export const ZMessageList = z.array(ZMessage);

export type Conversation = z.infer<typeof ZConversation>;
export type Message = z.infer<typeof ZMessage>;
