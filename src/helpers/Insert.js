class Insert {
    valueType(value) {
        return (typeof value);
    }
    build(args) {
        var table = args.input.table;
        var columns = args.input.columns;
        var params = [];
        for (var p = 0; p < columns.length; p++) {
            params.push(`$${p + 1}`);
        }
        var query = `INSERT INTO ${table}(${columns.join(",")}) VALUES(${params.join(",")}) RETURNING id;`;
        return query;
    }
}

module.exports = new Insert();