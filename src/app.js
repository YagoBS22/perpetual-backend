const express = require('express');
const cors = require('cors');
const moviesRoutes = require('./routes/movie');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
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

module.exports = app;
