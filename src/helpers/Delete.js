class Delete {
    valueType(value) {
        return (typeof value);
    }
    build(args) {
        var table = args.input.table;
        var query = `DELETE FROM ${table} `;
        query += this.where(args.input.criteria);
        query += ` RETURNING id;`;
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
        if (table) {
            return `${table}.${name} ${this.cop(op)} ${value}`;
        } else {
            return `${name} ${this.cop(op)} ${value}`;
        }
    }
    andOr(op, lop, table, name, value) {
        var clause = "";
        if (table) {
            if (lop == "AND") {
                return ` AND ${table}.${name} ${this.cop(op)} ${value}`;
            } else {
                clause += ` OR ${table}.${name} ${this.cop(op)} ${value}`;
            }
        } else {
            if (lop == "AND") {
                return ` AND ${name} ${this.cop(op)} ${value}`;
            } else {
                clause += ` OR ${name} ${this.cop(op)} ${value}`;
            }
        }
        return clause;
    }   
    where(criteria) {
        var clause = "";
        if (criteria) {
            clause = " WHERE ";
            var param = 1;
            criteria.forEach((item) => {
                var flag = false;
                if (item.lop) {
                    if (item.cop == "in") {
                        flag = true;
                        var in_values = JSON.parse(JSON.stringify(item.value));
                        var inv = [];
                        for (var i = 0; i < in_values.length; i++) {
                            inv.push(`$${param}`);
                            param++;
                        }
                        if (item.table) {
                            clause += ` ${item.lop} ${item.table}.${item.column} IN (${inv.join(",")})`;
                        } else {
                            clause += ` ${item.lop} ${item.column} IN (${inv.join(",")})`;
                        }
                    } else if (item.cop == "ni") {
                        flag = true;
                        var in_values = JSON.parse(JSON.stringify(item.value));
                        var inv = [];
                        for (var i = 0; i < in_values.length; i++) {
                            inv.push(`$${param}`);
                            param++;
                        }
                        if (item.table) {
                            clause += ` ${item.lop} ${item.table}.${item.column} NOT IN (${inv.join(",")})`;
                        } else {
                            clause += ` ${item.lop} ${item.column} NOT IN (${inv.join(",")})`;
                        }
                    } else {
                        clause += this.andOr(item.cop, item.lop, item.table, item.column, `$${param}`);
                    }
                }
                else {
                    if (item.cop == "in") {
                        flag = true;
                        var in_values = JSON.parse(JSON.stringify(item.value));
                        var inv = [];
                        for (var i = 0; i < in_values.length; i++) {
                            inv.push(`$${param}`);
                            param++;
                        }
                        if (item.table) {
                            clause += `${item.table}.${item.column} IN (${inv.join(",")})`;
                        } else {
                            clause += `${item.column} IN (${inv.join(",")})`;
                        }
                    } else if (item.cop == "ni") {
                        flag = true;
                        var in_values = JSON.parse(JSON.stringify(item.value));
                        var inv = [];
                        for (var i = 0; i < in_values.length; i++) {
                            inv.push(`$${param}`);
                            param++;
                        }
                        if (item.table) {
                            clause += `${item.table}.${item.column} NOT IN (${inv.join(",")})`;
                        } else {
                            clause += `${item.column} NOT IN (${inv.join(",")})`;
                        }
                    } else {
                        clause += this.condition(item.cop, item.table, item.column, `$${param}`);
                    }
                }
                if (flag === false) {
                    param++;
                }
            });
        }
        return clause;
    }
}

module.exports = new Delete();