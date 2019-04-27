const simple = {
    simple: async (_, args, ctx, info) => {
        return await ctx.db.simple(args);
    }
}
module.exports = simple;