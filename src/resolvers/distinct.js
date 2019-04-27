const distinct = {
    distinct: async (_, args, ctx, info) => {
        try {
            let rows = await ctx.db.distinct(args);
            if (rows.length > 0) {
                return {
                    count: rows.length,
                    rows: rows
                };
            } else {
                return Error("No data found");
            }
        } catch (err) {
            throw (err);
        }
    }
}
module.exports = distinct;