const mongoose = require('mongoose');

let isConnected;

const connectDatabase = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI não está definido no arquivo .env');
    throw new Error('MONGO_URI não está definido.');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('MongoDB conectado com sucesso!');
  } catch (error) {
    console.error('Erro na conexão com o MongoDB:', error.message);
    isConnected = false;
    throw error;
  }
};

module.exports = connectDatabase;