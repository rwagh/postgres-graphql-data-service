const update = {
    update: async (_, args, ctx, info) => {
        var ids = [];
        let result =  await ctx.db.update(args, args.input.values);        
        result.forEach(x=>{
            ids.push(Number(x.id));
        })
        return ids;
    }
}
module.exports = update;