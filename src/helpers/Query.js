const tables = require('../queries/tables.json');
const columns = require('../queries/columns.json');
const Data = require('./Data');

class Query {
    constructor() {
        this.Select = new Select();
        this.Insert = new Insert();
        this.Update = new Update();
        this.Delete = new Delete();
        this.table_query = tables.query;
        this.column_query = columns.query;
    }
    // Execute simple transaction
    async simple(queries) {        
        return await Data.simple(queries);
    }

    // Execute complex transaction
    async complex(args, info) {
        console.log(args, info);
        return await Data.complex(queries);
    }
    
    build(args){
        var inserts = args.input.insert;
        var updates = args.input.update;
        var deletes = args.input.delete;
        //console.log('inserts: ', inserts, 'updates: ', updates,'deletes: ', deletes);
        var queries = []
        if(inserts){
            inserts.forEach(item => {
                var args = {
                    input: item
                }
                queries.push({ status:'Inserted', table: item.table, query: this.Insert.build(args), values: item.values});
            });
        }        
        if(updates){
            updates.forEach(item => {
                var args = {
                    input: item
                }
                queries.push({ table: item.table, query: this.Update.build(args), values: item.values});
            });
        }        
        if(deletes){
            deletes.forEach(item => {
                var args = {
                    input: item
                }
                queries.push({ table: item.table, query: this.Delete.build(args)});
            });
        }
        return queries;
    }

    validateSelect(args) {
        if (args.columns === undefined || args.columns === "") {
            return Error('Columns property not provided!');
        }

        if (args.criteria) {
            for (var idx = 0; idx < args.criteria.length; idx++) {
                var item = args.criteria[idx];
                if (item.column === undefined || item.column === null || item.column === "") {
                    return Error('Column name not provided!');
                }
                if (item.value === undefined || item.value === null || item.value === "") {
                    return Error(`Value for column ${item.column} not provided!`);
                }
                if (!Array.isArray(item.value)) {
                    if (item.cop == "in" || item.cop == "ni") {
                        return Error('Value must be array!');
                    }
                }
            }
        }
    }

    validateInsert(args) {
        if (!args.table && args.table !== "") {
            return Error('Table name not provided!');
        }
        if (args.columns) {
            for (var idx = 0; idx < args.columns.length; idx++) {
                var item = args.columns[idx];
                if (item.name === undefined || item.name === null || item.name === "") {
                    return Error('Column name not provided!');
                }
                if (item.value === undefined || item.value === null || item.value === "") {
                    return Error(`Value for column ${item.name} not provided!`);
                }
            }
        }
    }

    valueType(value) {
        return (typeof value);
    }
}
module.exports = new Query();