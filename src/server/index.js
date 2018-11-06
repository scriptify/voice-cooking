const mongoose = require('mongoose');
const dotenv = require('dotenv');
const setupGraphQLServer = require('./interfaces/graphql');

async function main() {
  dotenv.config();

  await mongoose.connect(process.env.MONGO_DB_URI, { useNewUrlParser: true });
  const server = await setupGraphQLServer();
  server.start({
    playground: '/playground',
    port: process.env.PORT || 4000
  });
}

main();
