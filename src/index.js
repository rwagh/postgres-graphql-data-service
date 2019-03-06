require('dotenv').config();
const { GraphQLServer } = require('graphql-yoga');
const { importSchema } = require('graphql-import');
const path = require('path');
const Query = require('./helpers/Query');

const typeDefs = importSchema(path.join(__dirname, 'schema.graphql'));
const resolvers = require('./resolvers');

const server = new GraphQLServer({
  typeDefs, resolvers, context: req => ({
    ...req,
    Query
  })
})

const options = {
  port: process.env.SERVICE_PORT,
  endpoint: process.env.SERVICE_ENDPOINT,
  subscriptions: '/subscriptions',
  playground: '/playground',
}

server.start(options, ({ port }) =>
  console.log(
    `Server started, listening on port ${port}.`,
  ),
);