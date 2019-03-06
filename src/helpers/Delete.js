const Data = require('./Data');

class Delete {
    valueType(value) {
        return (typeof value);
    }
    build(args){        
        var table = args.input.table;        
        var query = `DELETE FROM ${table} `;
        query += this.where(args.input.criteria);
        query += ` RETURNING id;`;        
        return query;
    }
    async execute(sql) {
        return await Data.execute(sql, null);
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
}

module.exports = Delete;