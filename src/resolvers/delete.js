const del = {
    delete: async (_, args, ctx, info) => {
        try {
            let result = await ctx.db.delete(args);
            if (result[0]) {
                return result[0].id;
            } else {
                return Error("No data found!");
            }
        } catch (err) {
            return err;
        }
    }
}
module.exports = del;