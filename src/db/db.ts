import postgres from "postgres";

const connectionString =
	process.env.DATABASE_URL || "postgres://user:password@localhost:5432/app_bdj";

const sql = postgres(connectionString, {
	transform: {
		undefined: null,
	},
});

export default sql;
