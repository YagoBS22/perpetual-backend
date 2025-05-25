// perpetual-project/perpetual-backend/tests/setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

module.exports = async function () {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGO_URI_JEST_GLOBAL = mongoUri;
  global.__MONGO_INSTANCE__ = mongoServer;
  console.log(`MongoDB Memory Server (global) started at ${mongoUri}`);
};