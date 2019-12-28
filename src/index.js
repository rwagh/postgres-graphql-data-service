require('dotenv').config();
const { GraphQLServer } = require('graphql-yoga');
const { makeExecutableSchema } = require('graphql-tools')
const { importSchema } = require('graphql-import');
const path = require('path');
const db = require('./helpers/Data');

const typeDefs = importSchema(path.join(__dirname, 'schema.graphql'));
const resolvers = require('./resolvers');

const validate_schema = async (resolve, parent, args, ctx, info) => {
  try {
    let valid = ctx.db.isValid(args);
    if (valid) {
      let result = resolve();
      return result;
    } else {
      return Error("Syntax error in schema!");
    }
  } catch (err) {
    return Error(err);
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })
const server = new GraphQLServer({
  schema: schema, context: req => ({
    ...req,
    db
  }), middlewares: [validate_schema]
})

const options = {
  port: process.env.PORT,
  endpoint: process.env.DAL_ENDPOINT,
  subscriptions: '/subscriptions',
  playground: '/playground',
}

server.start(options, ({ port }) => {
  console.log(
    `Server started, listening on port ${port}.`,
  )
});
