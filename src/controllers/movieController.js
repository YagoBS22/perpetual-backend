const movieService = require('../services/movieService');

exports.createMovie = async (req, res) => {
  try {
    const { title, genre, releaseYear, rating } = req.body;
    if (!title) return res.status(400).json({ error: 'Título é obrigatório' });

    const movie = await movieService.create({ title, genre, releaseYear, rating }, req.user.id);
    res.status(201).json(movie);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar filme' });
  }
};

exports.getMovies = async (req, res) => {
  try {
    const movies = await movieService.getAllByUser(req.user.id);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar filmes' });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const movie = await movieService.getByIdAndUser(req.params.id, req.user.id);
    if (!movie) return res.status(404).json({ error: 'Filme não encontrado' });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar filme' });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const updated = await movieService.updateByIdAndUser(req.params.id, req.user.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Filme não encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar filme' });
  }
};

exports.partialUpdateMovie = async (req, res) => {
  try {
    const updated = await movieService.partialUpdateByIdAndUser(req.params.id, req.user.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Filme não encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar filme' });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const deleted = await movieService.deleteByIdAndUser(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Filme não encontrado' });
    res.json({ message: 'Filme excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir filme' });
  }
};
