const fs = require('fs');
const util = require('util');
const path = require('path');
const { GraphQLServer } = require('graphql-yoga');

const resolvers = require('./resolvers');

const recipe = require('../../bussiness/models/Recipe');

const readFile = util.promisify(fs.readFile);

module.exports = async function setupGraphQLServer() {
  const typeDefs = (await readFile(path.resolve(__dirname, './types.graphql'))).toString();
  const server = new GraphQLServer({
    typeDefs,
    resolvers,
    context: ({ request }) => ({
      req: request,
      models: { recipe }
    })
  });
  return server;
};
