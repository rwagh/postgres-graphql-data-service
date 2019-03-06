require('dotenv').config();
const resolvers = {
    Query: {
        tables: async (_, args, ctx, info) => {
            var query = ctx.Query.table_query;
            let result = await ctx.Query.Select.execute(query);
            return result;
        },
        columns: async (_, args, ctx, info) => {
            var query = ctx.Query.column_query;
            query = query.replace("@@table", `'${args.table}'`);
            let result = await ctx.Query.Select.execute(query);
            return result;
        },
        select: async (_, args, ctx, info) => {
            let columns = await ctx.Query.Select.columns(args);
            let tables = args.input.columns;
            let queryColumns = [];
            tables.forEach(row => {
                row.columns.forEach((x) => {
                    queryColumns.push({ table: row.table, name: x.name, alias: x.alias })
                });
            });
            let sql = ctx.Query.Select.build(args);
            var rows = [];
            let list = await ctx.Query.Select.execute(sql);
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

            //var err = Query.validateSelect(input);

            //return err;
            /*if (err) {
                return err;
            } else {                
                return rows;
            }*/
            //console.log(rows)
            return { count: rows.length, rows: rows };
        },
        count: async (_, args, ctx) => {
            var input = args.input;
            var sql = `SELECT COUNT(1) FROM ${input.table}`
            sql += ctx.Query.Select.where(input.criteria);
            let result = await ctx.Query.Select.execute(sql);
            return result[0].count;
        },
        min: async (_, args, ctx) => {
            var input = args.input;
            var sql = `SELECT MIN(${input.column}) FROM ${input.table}`
            sql += ctx.Query.Select.where(input.criteria);
            let result = await ctx.Query.Select.execute(sql, null);
            return result[0].min;
        },
        max: async (_, args, ctx) => {
            var input = args.input;
            var sql = `SELECT MAX(${input.column}) FROM ${input.table}`
            sql += ctx.Query.Select.where(input.criteria);
            let result = await ctx.Query.Select.execute(sql, null);
            return result[0].max;
        },
        sum: async (_, args, ctx) => {
            var input = args.input;
            var sql = `SELECT SUM(${input.column}) FROM ${input.table}`
            sql += ctx.Query.Select.where(input.criteria);
            let result = await ctx.Query.Select.execute(sql, null);
            return result[0].sum;
        },
        avg: async (_, args, ctx) => {
            var input = args.input;
            var sql = `SELECT AVG(${input.column}) FROM ${input.table}`
            sql += ctx.Query.Select.where(input.criteria);
            let result = await ctx.Query.Select.execute(sql, null);
            return result[0].avg;
        }
    },
    Mutation: {
        insert: async (_, args, ctx, info) => {
            //console.log(info);
            var sql = ctx.Query.Insert.build(args);
            let result = await ctx.Query.Insert.execute(sql, args.input.values);
            return result[0].id;
        },
        update: async (_, args, ctx, info) => {
            //console.log(info);
            var sql = ctx.Query.Update.build(args);
            let result = await ctx.Query.Update.execute(sql, args.input.values);
            return { count: result.length, rows: result };
        },
        delete: async (_, args, ctx, info) => {
            //console.log(info);
            var sql = ctx.Query.Delete.build(args);
            let result = await ctx.Query.Delete.execute(sql, null);
            return result[0].id;
        },
        simple: async (_, args, ctx, info) => {
            var queries = ctx.Query.build(args);
            return await ctx.Query.execute(queries);

            //console.log(result);
            //return 0;
        }
    }
}
module.exports = resolvers;