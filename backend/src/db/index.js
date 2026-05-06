import pkg from "pg";
const { Pool } = pkg;

// segurança: garantir que existe
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing in environment variables");
}

const isProd = process.env.NODE_ENV === "production";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProd ? { rejectUnauthorized: false } : false
});

export default pool;