const foreignkeys = {
    foreignkeys: async (_, args, ctx, info) => {
        try {
            let result = await ctx.db.foreignkeys(args.table);
            if (result) {
                return result;
            } else {
                return Error("No data found!");
            }
        } catch (err) {
            return err;
        }
    }
}
module.exports = foreignkeys;