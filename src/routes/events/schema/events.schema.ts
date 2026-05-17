import { z } from "zod";

export const ZEvent = z.object({
	id: z.number().int(),
	organizer_id: z.number().int(),
	title: z.string(),
	description: z.string(),
	cover_image: z.string().nullable(),
	start_time: z.date(),
	end_time: z.date(),
	location: z.string(),
	price: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.nullable(),
	max_capacity: z.number().int().nullable(),
	current_attendees: z.number().int(),
	is_registered: z.boolean().optional(),
	created_at: z.date(),
	updated_at: z.date(),
});

export const ZRegistration = z.object({
	id: z.number().int(),
	event_id: z.number().int(),
	user_id: z.number().int(),
	status: z.enum(["registered", "cancelled", "waitlist"]),
	registered_at: z.date(),
});

export const ZNewEvent = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	cover_image: z.string().optional(),
	start_time: z.iso.datetime(),
	end_time: z.iso.datetime(),
	location: z.string(),
	price: z.number().optional(),
	max_capacity: z.number().int().optional(),
});

export const ZEventList = z.array(ZEvent);

export type Event = z.infer<typeof ZEvent>;
export type Registration = z.infer<typeof ZRegistration>;
