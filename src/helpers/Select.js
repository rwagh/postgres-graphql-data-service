const table_columns = require('../queries/columns.json');
const Data = require('./Data');

class Select {
    valueType(value) {
        return (typeof value);
    }
    async columns(args) {
        var query = table_columns.query;
        let entities = args.input.columns;
        var columns =[]
        let tables = entities.map((entity) => {
            return entity.table;
        });

        var tbls="";
        tables.forEach( item => {
            tbls += `'${item}',`
        });
        tbls = tbls.substr(0,tbls.length - 1);        
        query = query.replace("@@table", tbls);        
        var results = await this.execute(query);
        
        results.forEach(item => {            
            columns.push(item);
        });        
        return columns;
    }
    async execute(sql) {
        return await Data.execute(sql, null);
    }
    build(args) {
        var query = "";
        var column_list = [];
        var table_list = [];
        var join_list = [];
        let entities = args.input.columns;
        let joins = args.input.joins;
        if (entities.length > 0) {
            entities.forEach((entity) => {                
                table_list.push(entity.table);
                entity.columns.forEach((y) => {
                    if(y.alias){
                        column_list.push(`${entity.table}.${y.name} as ${y.alias}`);
                    }else{
                        column_list.push(`${entity.table}.${y.name}`);
                    }
                });
            });

            if (joins) {
                joins.forEach((item) => {
                    switch (item.type) {
                        case "CROSS":
                            join_list.push(`${item.from.table} as ${item.from.table} 
                            CROSS JOIN ${item.to.table} as ${item.to.table}`);
                            break;
                        case "INNER":
                            join_list.push(`${item.from.table} as ${item.from.table} 
                            INNER JOIN ${item.to.table} as ${item.to.table} 
                            ON ${item.from.table}.${item.from.column} = ${item.to.table}.${item.to.column}`);
                            break;
                        case "LEFT_OUTER":
                            join_list.push(`${item.from.table} as ${item.from.table} 
                            LEFT OUTER JOIN ${item.to.table} as ${item.to.table} 
                            ON ${item.from.table}.${item.from.column} = ${item.to.table}.${item.to.column}`);
                            break;
                        case "RIGHT_OUTER":
                            join_list.push(`${item.from.table} as ${item.from.table} 
                            RIGHT OUTER JOIN ${item.to.table} as ${item.to.table} 
                            ON ${item.from.table}.${item.from.column} = ${item.to.table}.${item.to.column}`);
                            break;
                        case "FULL_OUTER":
                            join_list.push(`${item.from.table} as ${item.from.table} 
                            FULL OUTER JOIN ${item.to.table} as ${item.to.table} 
                            ON ${item.from.table}.${item.from.column} = ${item.to.table}.${item.to.column}`);
                            break;
                    }
                });
            }
        } else {
            return Error("Column(s) not provided!");
        }
        if (join_list.length > 0) {
            query = `SELECT ${column_list.join(",")} FROM ${join_list.join(" ")}`;
        } else {
            query = `SELECT ${column_list.join(",")} FROM ${table_list.join(",")}`;
        }

        query += this.where(args.input.criteria);
        query += this.order(args.input.orderBy);
        if (args.input.groupBy) {
            query += ` GROUP BY ${args.input.groupBy.join(",")}`;
        }

        let offset = args.input.offset;
        let limit = args.input.limit;
        if (limit) {
            query += ` LIMIT ${limit}`;
        }

        if (offset) {
            query += ` OFFSET ${offset}`;
        }

        return query;
    }

    cop(op) {
        var operator = "";
        if (op) {
            switch (op) {
                case "eq":
                    operator = "=";
                    break;
                case "ne":
                    operator = "!=";
                    break;
                case "gt":
                    operator = ">";
                    break;
                case "lt":
                    operator = "<";
                    break;
                case "ge":
                    operator = ">=";
                    break;
                case "le":
                    operator = "<=";
                    break;
                case "like":
                    operator = "ILIKE";
                    break;
            }
        }
        return operator;
    }
    condition(op, table, name, value) {
        var type = this.valueType(value);
        if (table) {
            if (type == "number") {
                return `${table}.${name} ${this.cop(op)} ${value}`;
            } else {
                return `${table}.${name} ${this.cop(op)} '${value}'`;
            }
        } else {
            if (type == "number") {
                return `${name} ${this.cop(op)} ${value}`;
            } else {
                return `${name} ${this.cop(op)} '${value}'`;
            }
        }
    }
    andOr(op, lop, table, name, value) {
        var type = this.valueType(value);
        var clause = "";
        if (table) {
            if (lop == "AND") {
                if (type == "number") {
                    return ` AND ${table}.${name} ${this.cop(op)} ${value}`;
                } else {
                    return ` AND ${table}.${name} ${this.cop(op)} '${value}'`;
                }
            } else {
                if (type == "number") {
                    clause += ` OR ${table}.${name} ${this.cop(op)} ${value}`;
                } else {
                    clause += ` OR ${table}.${name} ${this.cop(op)} '${value}'`;
                }
            }
        } else {
            if (lop == "AND") {
                if (type == "number") {
                    return ` AND ${name} ${this.cop(op)} ${value}`;
                } else {
                    return ` AND ${name} ${this.cop(op)} '${value}'`;
                }
            } else {
                if (type == "number") {
                    clause += ` OR ${name} ${this.cop(op)} ${value}`;
                } else {
                    clause += ` OR ${name} ${this.cop(op)} '${value}'`;
                }
            }
        }
        return clause;
    }
    where(criteria) {
        var clause = "";
        if (criteria) {
            clause = " WHERE ";
            criteria.forEach((item) => {
                if (Array.isArray(item.value)) {
                    switch (item.cop) {
                        case "in":
                            var in_values = JSON.parse(JSON.stringify(item.value));
                            var inv = "";
                            for (var i = 0; i < in_values.length; i++) {
                                if (this.valueType(in_values[i]) == "string") {
                                    inv += `'${in_values[i]}',`;
                                } else {
                                    inv += `${in_values[i]},`;
                                }
                            }
                            inv = inv.substring(0, inv.length - 1);
                            if (item.table) {
                                clause += `${item.table}.${item.column} IN (${inv})`;
                            } else {
                                clause += `${item.column} IN (${inv})`;
                            }
                            break;
                        case "ni":
                            var in_values = JSON.parse(JSON.stringify(item.value));
                            var inv = "";
                            for (var i = 0; i < in_values.length; i++) {
                                if (this.valueType(in_values[i]) == "string") {
                                    inv += `'${in_values[i]}',`;
                                } else {
                                    inv += `${in_values[i]},`;
                                }
                            }
                            inv = inv.substring(0, inv.length - 1);
                            if (item.table) {
                                clause += `${item.table}.${item.column} NOT IN (${inv})`;
                            } else {
                                clause += `${item.column} NOT IN (${inv})`;
                            }
                            break;
                    }
                } else {
                    if (item.lop) {
                        clause += this.andOr(item.cop, item.lop, item.table, item.column, item.value);
                    } else {
                        clause += this.condition(item.cop, item.table, item.column, item.value);
                    }
                }

            });
        }
        return clause;
    }
    order(order) {
        var clause = "";
        if (order) {
            clause = " ORDER BY ";
            for (var idx = 0; idx < order.length; idx++) {
                var item = order[idx];
                if (item.asc) {
                    clause += `${item.column} ASC,`
                } else {
                    clause += `${item.column} DESC,`
                }
            }
            clause = clause.slice(0, clause.length - 1);
        }
        return clause;
    }
}
module.exports = Select;