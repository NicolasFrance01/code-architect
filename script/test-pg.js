import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_fda1KJlcZS6T@ep-calm-haze-aiz10mql-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const res = await pool.query('SELECT * FROM projects');
        console.log("Raw Projects Output:", res.rows);
    } catch (e) {
        console.error("PG Error:", e);
    } finally {
        await pool.end();
    }
}

run();
