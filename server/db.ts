import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Enforce SSL for Neon and prevent Serverless hang timeouts
  ssl: {
    rejectUnauthorized: false
  },
  // Limit connections per serverless instance to prevent DB exhaustion
  max: 1
});
export const db = drizzle(pool, { schema });
