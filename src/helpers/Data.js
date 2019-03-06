const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
    host: process.env.PG_DB_HOST,
    port: process.env.PG_DB_PORT,
    user: process.env.PG_DB_USER,
    password: process.env.PG_DB_PASS,
    database: process.env.PG_DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
class Data {
    async execute(sql, values) {
        let result;
        const client = await pool.connect();
        if (values) {
            result = await client.query(sql, values);
            client.release();
        } else {
            result = await client.query(sql);
            client.release();
        }
        return result.rows;
    }
    async executeTransation(queries) {
        const client = await pool.connect();
        var requests = [];
        var result = [];
        try {
            await client.query('BEGIN');
            result = await Promise.all(queries.map(async item => {                
                if (item.values) {
                    let res = await client.query(item.query, item.values);
                    return { type: res.command, table: item.table, content: res.rows[0] } ;
                } else {
                    let res = await client.query(item.query);          
                    return { type: res.command, table: item.table, content: res.rows[0] } ;
                }
            }));
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e
        } finally {
            client.release();
        }
        console.log(result);
        return result;
    }
}
module.exports = new Data();