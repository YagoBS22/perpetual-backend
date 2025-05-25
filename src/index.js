const express = require('express');
const cors = require('cors');
const moviesRoutes = require('./routes/movie');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const connectDatabase = require("./database/connection");

const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Tudo pronto para navegar!!' });
});

app.use('/auth', authRoutes);
app.use('/movies', moviesRoutes);
app.use('/api', userRoutes);

app.use((req, res) => {
  console.log(`[Express 404] Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Rota não encontrada (dentro do Express app)' });
});

module.exports = async (req, res) => {
  console.log(`[Vercel Handler] Rota recebida: ${req.method} ${req.url}`);
  try {
    await connectDatabase();
    app(req, res);
  } catch (error) {
    console.error("Erro na função serverless exportada:", error);
    res.status(500).json({ error: "Erro interno do servidor ao tentar conectar ao DB ou processar rota." });
  }
};

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Servidor local rodando na porta ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Falha ao iniciar o servidor local (MongoDB não conectado):', err);
      process.exit(1);
    });
}