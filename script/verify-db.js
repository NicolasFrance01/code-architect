import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_fda1KJlcZS6T@ep-calm-haze-aiz10mql-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        console.log("Connecting to DB...");
        const tables = await pool.query(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';`);
        console.log("Tables:", tables.rows.map(r => r.tablename));

        for (const row of tables.rows) {
            if (row.tablename === 'projects' || row.tablename === 'equipment' || row.tablename === 'inventory') {
                const count = await pool.query(`SELECT count(*) FROM ${row.tablename}`);
                console.log(`Table ${row.tablename} has ${count.rows[0].count} rows.`);
            }
        }
    } catch (e) {
        console.error("DB Error:", e);
    } finally {
        pool.end();
    }
}
check();
