const movieService = require('../services/movieService');

exports.createMovie = async (req, res) => {
  try {
    const { title, genre, releaseYear, rating } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }
    const movie = await movieService.create({ title, genre, releaseYear, rating }, req.user.id);
    res.status(201).json(movie);
  } catch (err) {
    console.error("Erro ao criar filme:", err);
    res.status(500).json({ error: 'Erro ao criar filme' });
  }
};

exports.getMovies = async (req, res) => {
  try {
    const movies = await movieService.getAllByUser(req.user.id);
    res.json(movies);
  } catch (err) {
    console.error("Erro ao buscar filmes:", err);
    res.status(500).json({ error: 'Erro ao buscar filmes' });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const movie = await movieService.getByIdAndUser(req.params.id, req.user.id);
    if (!movie) {
      return res.status(404).json({ error: 'Filme não encontrado ou não pertence ao usuário' });
    }
    res.json(movie);
  } catch (err) {
    console.error("Erro ao buscar filme por ID:", err);
    res.status(500).json({ error: 'Erro ao buscar filme' });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const updated = await movieService.updateByIdAndUser(req.params.id, req.user.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Filme não encontrado ou não pertence ao usuário para atualizar' });
    }
    res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar filme:", err);
    res.status(500).json({ error: 'Erro ao atualizar filme' });
  }
};

exports.partialUpdateMovie = async (req, res) => {
  try {
    const updated = await movieService.partialUpdateByIdAndUser(req.params.id, req.user.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Filme não encontrado ou não pertence ao usuário para atualização parcial' });
    }
    res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar filme parcialmente:", err);
    res.status(500).json({ error: 'Erro ao atualizar filme' });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const deleted = await movieService.deleteByIdAndUser(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Filme não encontrado ou não pertence ao usuário para deletar' });
    }
    res.json({ message: 'Filme excluído com sucesso' });
  } catch (err) {
    console.error("Erro ao excluir filme:", err);
    res.status(500).json({ error: 'Erro ao excluir filme' });
  }
};