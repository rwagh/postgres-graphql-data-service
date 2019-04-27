const insert = {
    insert: async (_, args, ctx, info) => {
        let result = await ctx.db.insert(args, args.input.values);
        return result[0].id;
    }
}
module.exports = insert;