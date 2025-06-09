const User = require('../models/User');

const addOrUpdateMovie = async (req, res) => {
  const { tmdbId, rating, favorite, media_type } = req.body;
  const userId = req.user.id;

  if (!tmdbId || !media_type) {
    return res.status(400).json({ error: 'tmdbId e media_type são obrigatórios' });
  }

  if (!['movie', 'tv'].includes(media_type)) {
    return res.status(400).json({ error: 'media_type inválido. Deve ser "movie" ou "tv".' });
  }

  if (
    typeof rating !== 'undefined' &&
    rating !== null &&
    rating !== '' &&
    (rating < 0 || rating > 10)
  ) {
    return res.status(400).json({ error: 'Rating deve ser entre 0 e 10.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const movieIndex = user.movieList.findIndex(
      movie => movie.tmdbId === Number(tmdbId) && movie.media_type === media_type
    );

    let savedItem;

    if (movieIndex !== -1) {
      // Atualiza o filme existente
      if (typeof rating !== 'undefined') {
        user.movieList[movieIndex].rating = rating === null || rating === '' ? null : Number(rating);
      }
      if (typeof favorite !== 'undefined') {
        user.movieList[movieIndex].favorite = Boolean(favorite);
      }
      user.movieList[movieIndex].media_type = media_type;
      savedItem = user.movieList[movieIndex];
    } else {
      // Adiciona novo filme
      const newItem = {
        tmdbId: Number(tmdbId),
        media_type,
        rating: typeof rating !== 'undefined' && rating !== null && rating !== '' ? Number(rating) : null,
        favorite: typeof favorite !== 'undefined' ? Boolean(favorite) : false
      };
      user.movieList.push(newItem);
      savedItem = newItem;
    }

    try {
      await user.save();
    } catch (err) {
      return res.status(500).json({ error: 'Erro interno do servidor ao processar a solicitação de filme.' });
    }

    // Ajuste para retornar apenas os campos enviados originalmente pelo client
    const responseObj = {};
    if ('tmdbId' in req.body) responseObj.tmdbId = Number(tmdbId);
    if ('favorite' in req.body) responseObj.favorite = Boolean(favorite);
    if ('rating' in req.body) responseObj.rating = typeof rating !== 'undefined' && rating !== null && rating !== '' ? Number(rating) : null;

    return res.status(200).json(responseObj);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor ao processar a solicitação de filme.' });
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

    const index = user.movieList.findIndex(m => m.tmdbId === Number(tmdbId));
    if (index === -1) {
      return res.status(404).json({ error: 'Filme não encontrado na lista do usuário.' });
    }

    user.movieList.splice(index, 1);
    await user.save();
    return res.status(200).json({ message: 'Filme removido com sucesso.' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor ao processar a solicitação de remoção de filme.' });
  }
};

const getMovies = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId).select('movieList');
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    return res.status(200).json(user.movieList);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar filmes do usuário.' });
  }
};

const getUserProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId).select('name email createdAt movieList');
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const favoriteMoviesCount = user.movieList.filter(m => m.favorite).length;
    return res.status(200).json({
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      favoriteMoviesCount,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar o perfil do usuário.' });
  }
};

module.exports = {
  addOrUpdateMovie,
  removeMovie,
  getMovies,
  getUserProfile
};