import { z } from "zod";

export const ZNotification = z.object({
	id: z.uuid(),
	user_id: z.uuid(),
	type: z.string(),
	title: z.string(),
	content: z.string(),
	is_read: z.boolean(),
	resource_data: z.any().optional(),
	created_at: z.date(),
});

export const ZNotificationList = z.array(ZNotification);

export type Notification = z.infer<typeof ZNotification>;
