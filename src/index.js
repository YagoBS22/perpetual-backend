const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const moviesRoutes = require('./routes/movie');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

require("dotenv").config();
require("../src/database/connection")();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  const resp = { message: 'Tudo pronto para navegar!!' };
  res.json(resp).status(200);
});

app.use('/auth', authRoutes);

app.use('/movies', moviesRoutes);
app.use('/api', userRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB conectado');
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
})
.catch(err => {
  console.error('Erro ao conectar ao MongoDB:', err);
});

