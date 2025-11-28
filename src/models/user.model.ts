export interface UserRow {
	id: string;
	username: string;
	firstname: string | null;
	lastname: string | null;
	role: string;
	created_at: Date;
}
