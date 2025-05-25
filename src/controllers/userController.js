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

  if (typeof rating !== 'undefined' && (rating < 0 || rating > 10)) {
    return res.status(400).json({ error: 'Rating deve ser entre 0 e 10.' });
  }


  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const movieIndex = user.movieList.findIndex(movie => movie.tmdbId === Number(tmdbId) && movie.media_type === media_type);

    let savedItem;

    if (movieIndex > -1) {
      if (typeof rating !== 'undefined') {
        user.movieList[movieIndex].rating = rating === null || rating === '' ? null : Number(rating);
      }
      if (typeof favorite !== 'undefined') {
        user.movieList[movieIndex].favorite = Boolean(favorite);
      }
      savedItem = user.movieList[movieIndex];
    } else {
      const newItem = {
        tmdbId: Number(tmdbId),
        media_type: media_type,
        rating: typeof rating !== 'undefined' && rating !== null && rating !== '' ? Number(rating) : null,
        favorite: typeof favorite !== 'undefined' ? Boolean(favorite) : false
      };
      user.movieList.push(newItem);
      savedItem = newItem;
    }

    await user.save();
    res.status(200).json(savedItem);
  } catch (error) {
    console.error("Erro ao adicionar/atualizar filme na lista do usuário:", error);
    res.status(500).json({ error: 'Erro interno do servidor ao processar a solicitação de filme do usuário.' });
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
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const initialLength = user.movieList.length;
    user.movieList = user.movieList.filter(movie => movie.tmdbId !== parseInt(tmdbId));

    if (user.movieList.length === initialLength) {
        return res.status(404).json({ error: 'Filme não encontrado na lista do usuário para remoção.' });
    }

    await user.save();
    res.status(200).json({ message: 'Filme removido com sucesso.', movieList: user.movieList });
  } catch (error) {
    console.error("Erro ao remover filme da lista do usuário:", error);
    res.status(500).json({ error: 'Erro interno do servidor ao remover o filme da lista do usuário.' });
  }
};


const getMovies = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId).select('movieList');
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user.movieList || []);
  } catch (error) {
    console.error("Erro ao buscar filmes do usuário:", error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar os filmes do usuário.' });
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