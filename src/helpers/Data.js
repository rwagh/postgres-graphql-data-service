const { Pool } = require('pg');
require('dotenv').config();
var JefNode = require('json-easy-filter').JefNode;
const tables = require('../queries/tables.json');
const columns = require('../queries/columns.json');
const foreignkeys = require('../queries/foreignkeys.json');
const Select = require('./Select');
const Insert = require('./Insert');
const Update = require('./Update');
const Delete = require('./Delete');
const Distinct = require('./Distinct');

const letters = new RegExp(/^[_a-zA-Z0-9]+$/);
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
    constructor() {
        this.Distinct = Distinct;
        this.Select = Select;
        this.Insert = Insert;
        this.Update = Update;
        this.Delete = Delete;
        this.table_query = tables.query;
        this.column_query = columns.query;
        this.foreign_keys = foreignkeys.query;
    }

    async execute(sql, values) {
        let result;
        var client;
        try {
            client = await pool.connect();
            if (values) {
                console.log(sql, values);
                result = await client.query(sql, values);
                client.release();
            } else {
                console.log(sql);
                result = await client.query(sql);
                client.release();
            }
            return result.rows;
        } catch (err) {
            throw (err);
        }
    }

    async tables() {
        var query = this.table_query;
        try {
            let results = await this.execute(query, null);
            return results.map(item => {
                return item.name
            });
        } catch (err) {
            throw (err);
        }
    }

    async columns(tables) {
        var query = this.column_query;
        var tbls = "";
        tables.forEach((table) => {
            tbls += `'${table.name}',`
        });
        tbls = tbls.substr(0, tbls.length - 1);
        query = query.replace("@@table", tbls);
        try {
            let results = await this.execute(query, null);
            return results.map(item => {
                return item;
            });
        } catch (err) {
            throw (err);
        }
    }

    async foreignkeys(table) {
        var query = foreignkeys.query;
        query = query.replace("@@table", table);
        try {
            console.log(query);
            let results = await this.execute(query, null);
            return results.map(item => {
                return item;
            });
        } catch (err) {
            throw (err);
        }
    }
    async select(args) {
        var query = Select.build(args);
        delete args.input["groupBy"];
        var values = this.extactValues(args);
        let tables = args.input.tables;
        let columns = await this.columns(tables);
        let queryColumns = [];
        tables.forEach(table => {
            table.columns.forEach((column) => {
                queryColumns.push({ table: table.name, name: column.name, alias: column.alias })
            });
        });
        var rows = [];
        try {
            let list = await this.execute(query, values);
            list.forEach((item) => {
                var keys = Object.keys(item);
                keys.forEach((x) => {
                    var column = queryColumns.find((c) => {
                        return c.name === x || (c.alias !== undefined && c.alias === x);
                    });
                    var tbl_col = columns.find((c) => {
                        return c.name === column.name && c.table === column.table;
                    });
                    if (tbl_col.type === "bigint" || tbl_col.type === "integer" || tbl_col.type === "real" || tbl_col.type === "numeric") {
                        item[x] = Number(item[x]);
                    }
                    else if (tbl_col.type === "boolean") {
                        item[x] = Boolean(item[x]);
                    }
                });
                rows.push(item);
            });
            return rows;
        } catch (err) {
            throw (err);
        }
    }

    async distinct(args) {
        var query = Distinct.build(args);
        delete args.input["groupBy"];
        var values = this.extactValues(args);
        let tables = args.input.tables;
        let columns = await this.columns(tables);
        let queryColumns = [];
        tables.forEach(table => {
            table.columns.forEach((column) => {
                queryColumns.push({ table: table.name, name: column.name, alias: column.alias })
            });
        });

        var rows = [];
        try {
            let list = await this.execute(query, values);
            list.forEach((item) => {
                var keys = Object.keys(item);
                keys.forEach((x) => {
                    var column = queryColumns.find((c) => {
                        return c.name === x || (c.alias !== undefined && c.alias === x);
                    });
                    var tbl_col = columns.find((c) => {
                        return c.name === column.name && c.table === column.table;
                    });
                    if (tbl_col.type === "bigint" || tbl_col.type === "integer" || tbl_col.type === "real" || tbl_col.type === "numeric") {
                        item[x] = Number(item[x]);
                    }
                    else if (tbl_col.type === "boolean") {
                        item[x] = Boolean(item[x]);
                    }
                });
                rows.push(item);
            });
            return rows;
        } catch (err) {
            throw (err);
        }
    }

    async count(args) {
        var input = args.input;
        var sql = `SELECT COUNT(1) FROM ${input.table}`;
        sql += this.Select.where(input.criteria);
        var values = this.extactValues(args);
        let result = await this.execute(sql, values);
        return result[0].count;
    }

    async min(args) {
        var input = args.input;
        var sql = `SELECT MIN(${input.column}) FROM ${input.table}`
        sql += this.Select.where(input.criteria);
        var values = this.extactValues(args);
        let result = await this.execute(sql, values);
        return result[0].min;
    }

    async max(args) {
        var input = args.input;
        var sql = `SELECT MAX(${input.column}) FROM ${input.table}`
        sql += this.Select.where(input.criteria);
        var values = this.extactValues(args);
        let result = await this.execute(sql, values);
        return result[0].max;
    }

    async sum(args) {
        var input = args.input;
        var sql = `SELECT SUM(${input.column}) FROM ${input.table}`
        sql += this.Select.where(input.criteria);
        var values = this.extactValues(args);
        let result = await this.execute(sql, values);
        return result[0].sum;
    }

    async avg(args) {
        var input = args.input;
        var sql = `SELECT AVG(${input.column}) FROM ${input.table}`
        sql += this.Select.where(input.criteria);
        var values = this.extactValues(args);
        let result = await this.execute(sql, values);
        return result[0].avg;
    }

    async insert(args, values) {
        var query = Insert.build(args);
        try {
            return await this.execute(query, values);
        } catch (err) {
            throw (err);
        }
    }

    async update(args, values) {
        var query = Update.build(args);
        var extract_values = args.input;
        delete extract_values["columns"];
        var values = this.extactValues(extract_values);
        try {
            return await this.execute(query, values);
        } catch (err) {
            throw (err);
        }
    }

    async delete(args) {
        var query = Delete.build(args);
        var values = this.extactValues(args);
        try {
            return await this.execute(query, values);
        } catch (err) {
            throw (err);
        }
    }

    async simple(args) {
        var inserts = args.input.insert;
        var updates = args.input.update;
        var deletes = args.input.delete;

        var queries = []
        if (inserts) {
            inserts.forEach(item => {
                var args = {
                    input: item
                };

                var query = { table: item.table, query: Insert.build(args) };
                delete args.input["columns"];
                var values = this.extactValues(args.input);
                query.values = values;
                queries.push(query);
            });
        }
        if (updates) {
            updates.forEach(item => {
                var args = {
                    input: item
                };

                var query = { table: item.table, query: Update.build(args) };
                delete args.input["columns"];
                var values = this.extactValues(args.input);
                query.values = values;
                queries.push(query);
            });
        }
        if (deletes) {
            deletes.forEach(item => {
                var args = {
                    input: item
                };

                var query = { table: item.table, query: Delete.build(args) };
                delete args.input["columns"];
                var values = this.extactValues(args.input);
                query.values = values;
                queries.push(query);
            });
        }

        const client = await pool.connect();
        var result = [];
        try {
            await client.query('BEGIN');
            result = await Promise.all(queries.map(async item => {
                if (item.values) {
                    let res = await client.query(item.query, item.values);
                    return { type: res.command, table: item.table, content: res.rows[0] };
                } else {
                    let res = await client.query(item.query);
                    return { type: res.command, table: item.table, content: res.rows[0] };
                }
            }));
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
        return result;
    }

    async complex(args) {

        const client = await pool.connect();
        var result = [];
        try {
            await client.query('BEGIN');
            this.executeRecursively(client, args, undefined);
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

    async executeRecursively(client, input, val) {
        var query, values = [], res, fks;
        if (input.complex) {
            if (input.insert) {
                if (val) {
                    fks = this.fkeys(val.table);
                    fks.forEach(key => {
                        input.insert.columns.push(key.column_name);
                        input.insert.values.push(val.content.id);
                    });
                }
                var args = {
                    input: input.insert
                }
                query = Insert.build(args);
                values = input.insert.values;
                res = await client.query(query, values);
            } else if (input.update) {
                if (val) {
                    fks = this.fkeys(val.table);
                    fks.forEach(key => {
                        input.insert.columns.push(key.column_name);
                        input.insert.values.push(val.content.id);
                    });
                }
                var args = {
                    input: input.insert
                }
                query = Insert.build(args);
                values = input.insert.values;
                res = await client.query(query, values);
            } else if (input.delete) {
                query = Delete.build(args);
                res = await client.query(query);
            }
            return executeRecursively(input.complex, { type: res.command, table: item.table, content: res.rows[0] });
        } else {
            if (input.insert) {
                query = Insert.build(args);
                values = input.insert.values;
                res = await client.query(query, values);
            } else if (input.update) {
                query = Update.build(args);
                values = input.insert.values;
                res = await client.query(query, values);
            } else if (input.delete) {
                query = Delete.build(args);
                res = await client.query(query);
            }
            return { type: res.command, table: item.table, content: res.rows[0] };
        }
    }

    schema(args) {
        var keys = Object.keys(args);
        return keys.map(key => {
            if (key !== "value" && key !== "values") {
                if (typeof args[key] == "object") {
                    return this.schema(args[key])
                } else {
                    if (typeof args[key] === "string") {
                        return { valid: letters.test(args[key]) }
                    }
                }
            }
        });
    }
    extact(input) {
        var keys = Object.keys(input);
        return keys.map(key => {
            if (typeof input[key] == "object") {
                return this.extact(input[key])
            } else {
                if (key === "value" || key === "values") {
                    return input[key];
                } else {
                    if (Number(key) >= 0) {
                        return input[key];
                    }
                }
            }
        });
    }

    extactValues(args) {
        var values_from_schema = this.extact(args);
        var values = new JefNode(values_from_schema).filter(function (node) {
            var value;
            switch (node.type()) {
                case "number":
                    value = node.value;
                    break;
                case "boolean":
                    value = node.value;
                    break;
                case "string":
                    value = node.value;
                    break;
            }

            return value;
        });
        return values;
    }

    isValid(args) {
        var counts = 0;
        var validated_schema = this.schema(args);
        var valid = new JefNode(validated_schema).filter(function (node) {
            if (node.type() === 'boolean') {
                return { valid: node.value };
            }
        });

        valid.forEach(x => {
            if (x.valid === false) {
                counts++;
            }
        });
        return (counts > 0) ? false : true;
    }
}
module.exports = new Data();