require("dotenv").config();
const app = require('./app');
const connectDatabase = require('./database/connection');

// Exporta função para Vercel ou ambiente serverless
module.exports = async (req, res) => {
  console.log(`[Vercel Handler] Rota recebida: ${req.method} ${req.url}`);
  try {
    await connectDatabase();
    app(req, res); // app aqui é uma função handler do Express
  } catch (error) {
    console.error("Erro na função serverless exportada:", error);
    res.status(500).json({ error: "Erro interno do servidor ao tentar conectar ao DB ou processar rota." });
  }
};

// Executa localmente com Node (npm run dev, por exemplo)
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
