const resolvers = {
    Query: {
        ...require("./tables"),
        ...require("./columns"),
        ...require("./foreignkeys"),
        ...require("./function"),
        ...require("./select"),
        ...require("./distinct")
    },
    Mutation: {
        ...require("./insert"),
        ...require("./update"),
        ...require("./delete"),
        ...require("./simple"),
        ...require("./complex")
    },
}
module.exports = resolvers;