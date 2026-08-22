import { Pool } from 'pg';
const connectionString = process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    'postgres://postgres:Dhakool1$@localhost:5433/kago_wallet?sslmode=disable';
const pool = new Pool({ connectionString });
pool.on('error', (err) => {
    console.error('[db] unexpected error on idle client', err);
});
export async function query(text, params) {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('[db] executed query', { text, duration, rows: result.rowCount });
    return result;
}
export async function getClient() {
    return pool.connect();
}
export async function close() {
    await pool.end();
}
export { Pool };
