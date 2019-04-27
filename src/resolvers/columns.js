const columns = {
    columns: async (_, args, ctx, info) => {
        var tables = [{ name: args.table }];
        let columns = await ctx.db.columns(tables);
        if (columns) {
            return columns;
        } else {
            return Error("No data found!")
        }
    }
}
module.exports = columns;