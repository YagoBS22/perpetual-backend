const User = require('../models/User');

const addOrUpdateMovie = async (req, res) => {
  const { tmdbId, rating, favorite, media_type } = req.body;
  const userId = req.user.id;

  // Validação básica dos campos obrigatórios
  if (typeof tmdbId === 'undefined' || typeof media_type === 'undefined') {
    return res.status(400).json({ error: 'tmdbId e media_type são obrigatórios' });
  }

  // Validação do tipo de mídia
  if (!['movie', 'tv'].includes(media_type)) {
    return res.status(400).json({ error: 'media_type inválido. Deve ser "movie" ou "tv".' });
  }

  // Validação do rating
  if (typeof rating !== 'undefined' && (rating < 0 || rating > 10)) {
    return res.status(400).json({ error: 'Rating deve ser entre 0 e 10.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Busca o índice do filme na lista do usuário
    const movieIndex = user.movieList.findIndex(
      movie => movie.tmdbId === Number(tmdbId) && movie.media_type === media_type
    );

    let savedItem;

    if (movieIndex > -1) {
      // Atualiza o filme existente
      if (typeof rating !== 'undefined') {
        user.movieList[movieIndex].rating = rating === null || rating === '' ? null : Number(rating);
      }
      if (typeof favorite !== 'undefined') {
        user.movieList[movieIndex].favorite = Boolean(favorite);
      }
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

    await user.save();
    return res.status(200).json(savedItem);
  } catch (error) {
    // Mensagem de erro alinhada ao teste
    return res.status(500).json({ error: 'Erro interno do servidor ao processar a solicitação de filme.' });
  }
};

module.exports = { addOrUpdateMovie };