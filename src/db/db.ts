try { process.loadEnvFile(); } catch {}

import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST || "localhost"}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB}`;

const sql = postgres(connectionString, { transform: { undefined: null }});
export default sql;
