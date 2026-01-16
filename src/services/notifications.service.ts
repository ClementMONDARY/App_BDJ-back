import sql from "../db/db.js";

interface CreateNotificationParams {
	userId: string;
	type: string;
	title: string;
	content: string;
	resourceData?: object;
	sqlTransaction?: typeof sql; // Optional transaction handler
	ensureUnique?: boolean; // If true, avoids creating duplicate unread notifications
}

/**
 * Creates a new notification for a user.
 * Can be part of an existing transaction if sqlTransaction is provided.
 */
export async function createNotification({
	userId,
	type,
	title,
	content,
	resourceData = {},
	sqlTransaction,
	ensureUnique = false,
}: CreateNotificationParams) {
	const db = sqlTransaction || sql;

	if (ensureUnique) {
		const [existing] = await db`
            SELECT id FROM notifications
            WHERE user_id = ${userId}
              AND type = ${type}
              AND is_read = FALSE
              AND resource_data @> ${db.json(resourceData as any)}
            LIMIT 1
        `;

		if (existing) {
			await db`
                UPDATE notifications
                SET created_at = NOW(), content = ${content}, title = ${title}
                WHERE id = ${existing.id}
            `;
			return;
		}
	}

	await db`
        INSERT INTO notifications (user_id, type, title, content, resource_data)
        VALUES (${userId}, ${type}, ${title}, ${content}, ${db.json(resourceData as any)})
    `;
}

interface NotifyAllParams {
	type: string;
	title: string;
	content: string;
	resourceData?: object;
	excludeUserId?: string;
	sqlTransaction?: typeof sql;
}

export async function notifyAllUsers({
	type,
	title,
	content,
	resourceData = {},
	excludeUserId,
	sqlTransaction,
}: NotifyAllParams) {
	const db = sqlTransaction || sql;

	await db`
        INSERT INTO notifications (user_id, type, title, content, resource_data)
        SELECT id, ${type}, ${title}, ${content}, ${db.json(resourceData as any)}
        FROM users
        WHERE id != ${excludeUserId || "00000000-0000-0000-0000-000000000000"}
    `;
}
