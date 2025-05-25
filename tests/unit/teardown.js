// perpetual-project/perpetual-backend/tests/teardown.js
const mongoose = require('mongoose');

module.exports = async function () {
  await mongoose.disconnect();
  if (global.__MONGO_INSTANCE__) {
    await global.__MONGO_INSTANCE__.stop();
    console.log('MongoDB Memory Server (global) stopped via teardown.js');
  }
};