const fs = require('fs');
const util = require('util');
const path = require('path');
const { GraphQLServer } = require('graphql-yoga');
const express = require('express');

const resolvers = require('./resolvers');

const recipe = require('../../bussiness/models/Recipe');
const category = require('../../bussiness/models/Category');

const readFile = util.promisify(fs.readFile);

module.exports = async function setupGraphQLServer() {
  const typeDefs = (await readFile(path.resolve(__dirname, './types.graphql'))).toString();
  const server = new GraphQLServer({
    typeDefs,
    resolvers,
    context: ({ request }) => ({
      req: request,
      models: { recipe, category }
    })
  });
  server.express.use(express.static(path.join(__dirname, '../../../../build/client')));
  return server;
};
