//const logger = require("../helpers/logger");
const select = {
    select: async (_, args, ctx, info) => {
        //var log = logger.model;
        //var url = `${process.env.BASE_URL}:${process.env.DAL_PORT}${process.env.DAL_ENDPOINT}`;

        //var result, message;
        try {
            let rows = await ctx.db.select(args);
            if (rows.length > 0) {
                /*log.content = {
                    request: ctx.request,
                    response: result,
                    timestamp: (new Date()).toUTCString(),
                };
                message = `Request has been successfully completed`;
                logger.log('debug', message, log);
                */
                return {
                    count: rows.length,
                    rows: rows
                };
            } else {
                /*log.content = {
                    url: url,
                    request: ctx.request,
                    response: "No data found",                  
                    timestamp: (new Date()).toUTCString(),
                };
                message = `Request has been successfully completed!`;
                logger.log('info', message, log);*/
                return Error("No data found!");
            }
        } catch (err) {
            return Error(`Error occured while precessing request!\n${err}`);
            /*log.content = {
                request: ctx.request,
                response: err,
                timestamp: (new Date()).toUTCString(),
            };
            message = `Error occured while precessing request!`;
            logger.log('error', message, log);*/
        }
    }
}
module.exports = select;