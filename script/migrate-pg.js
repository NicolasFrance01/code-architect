import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_fda1KJlcZS6T@ep-calm-haze-aiz10mql-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log("Applying Schema Update...");
        await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS hours_used numeric DEFAULT '0' NOT NULL;`);
        console.log("Schema Update Successful!");
    } catch (e) {
        console.error("PG Error:", e);
    } finally {
        await pool.end();
    }
}

run();
