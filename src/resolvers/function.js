const functions = {
    count: async (_, args, ctx, info) => {
        try {
            return await ctx.db.count(args);
        } catch (err) {
            return err;
        }
    },
    sum: async (_, args, ctx, info) => {
        try {
            return await ctx.db.sum(args);
        } catch (err) {
            return err;
        }
    },
    avg: async (_, args, ctx, info) => {
        try {
            return await ctx.db.avg(args);
        } catch (err) {
            return err;
        }
    },
    min: async (_, args, ctx, info) => {
        try {
            return await ctx.db.min(args);
        } catch (err) {
            return err;
        }
    },
    max: async (_, args, ctx, info) => {
        try {
            return await ctx.db.max(args);
        } catch (err) {
            return err;
        }
    }
}
module.exports = functions;