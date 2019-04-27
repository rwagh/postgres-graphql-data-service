const tables = {
    tables: async (_, args, ctx, info) => {
        try {
            let rows = await ctx.db.tables();
            if (rows) {
                return rows;
            } else {
                return Error("No data found!");
            }
        } catch (err) {
            return Error(err);
        }
    }
}
module.exports = tables;