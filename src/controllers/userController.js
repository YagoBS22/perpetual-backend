const User = require('../models/User');

const addOrUpdateMovie = async (req, res) => {
  const { tmdbId, rating, favorite, media_type } = req.body;
  const userId = req.user.id;

  if (typeof tmdbId === 'undefined' || typeof media_type === 'undefined') {
    return res.status(400).json({ error: 'tmdbId e media_type são obrigatórios' });
  }
  if (!['movie', 'tv'].includes(media_type)) {
    return res.status(400).json({ error: 'media_type inválido. Deve ser "movie" ou "tv".' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const movieIndex = user.movieList.findIndex(movie => movie.tmdbId === tmdbId);

    if (movieIndex > -1) {
      if (typeof rating !== 'undefined') user.movieList[movieIndex].rating = rating;
      if (typeof favorite !== 'undefined') user.movieList[movieIndex].favorite = favorite;
      user.movieList[movieIndex].media_type = media_type;
    } else {
      user.movieList.push({
        tmdbId,
        media_type,
        rating: typeof rating !== 'undefined' ? rating : null,
        favorite: typeof favorite !== 'undefined' ? favorite : false
      });
    }

    await user.save();
    const savedMovie = user.movieList.find(movie => movie.tmdbId === tmdbId);
    res.status(200).json(savedMovie || {});
  } catch (error) {
    console.error("Erro ao adicionar/atualizar filme:", error);
    res.status(500).json({ error: 'Erro interno do servidor ao processar a solicitação de filme.' });
  }
};

const removeMovie = async (req, res) => {
  const { tmdbId } = req.params;
  const userId = req.user.id;

  if (!tmdbId) {
    return res.status(400).json({ error: 'tmdbId do filme é obrigatório nos parâmetros da URL.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const initialLength = user.movieList.length;
    user.movieList = user.movieList.filter(movie => movie.tmdbId !== parseInt(tmdbId));

    if (user.movieList.length === initialLength) {
        return res.status(404).json({ error: 'Filme não encontrado na lista do usuário.' });
    }

    await user.save();
    res.status(200).json({ message: 'Filme removido com sucesso.', movieList: user.movieList });
  } catch (error) {
    console.error("Erro ao remover filme:", error);
    res.status(500).json({ error: 'Erro interno do servidor ao remover o filme.' });
  }
};


const getMovies = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId).select('movieList');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user.movieList);
  } catch (error) {
    console.error("Erro ao buscar filmes do usuário:", error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar os filmes.' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('name email createdAt movieList');

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const favoriteMoviesCount = user.movieList.filter(movie => movie.favorite).length;

    res.status(200).json({
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      favoriteMoviesCount: favoriteMoviesCount,
    });
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar o perfil do usuário.' });
  }
};

module.exports = { addOrUpdateMovie, removeMovie, getMovies, getUserProfile };
