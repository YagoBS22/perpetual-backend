const userController = require('../../../src/controllers/userController');
const User = require('../../../src/models/User');

jest.mock('../../../src/models/User');

describe('UserController Unit Tests', () => {
  let mockRequest;
  let mockResponse;
  let mockUserInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserInstance = {
      _id: 'mockUserId123',
      name: 'Mock User',
      email: 'mock@example.com',
      movieList: [
        { tmdbId: 1, favorite: true, rating: 5, _id: 'movie1', media_type: 'movie' },
        { tmdbId: 2, favorite: false, rating: 4, _id: 'movie2', media_type: 'tv' },
      ],
      save: jest.fn().mockResolvedValue(true),
    };

    mockRequest = {
      user: { id: 'mockUserId123' },
      body: {},
      params: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
    };

    User.findById.mockResolvedValue(mockUserInstance);
  });

  describe('addOrUpdateMovie', () => {
    it('deve adicionar um novo filme à lista do usuário', async () => {
      mockRequest.body = { tmdbId: 3, favorite: true, rating: 5, media_type: 'movie' };
      await userController.addOrUpdateMovie(mockRequest, mockResponse);

      expect(User.findById).toHaveBeenCalledWith('mockUserId123');
      expect(mockUserInstance.movieList).toContainEqual(
        expect.objectContaining({
          tmdbId: 3,
          favorite: true,
          rating: 5,
          media_type: 'movie'
        })
      );
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        tmdbId: 3,
        favorite: true,
        rating: 5
      });
    });

    it('deve atualizar um filme existente', async () => {
      mockRequest.body = { tmdbId: 1, favorite: false, rating: 3, media_type: 'movie' };
      await userController.addOrUpdateMovie(mockRequest, mockResponse);

      const updated = mockUserInstance.movieList.find(m => m.tmdbId === 1);
      expect(updated.favorite).toBe(false);
      expect(updated.rating).toBe(3);
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        tmdbId: 1,
        favorite: false,
        rating: 3
      });
    });

    it('deve retornar 400 se tmdbId ou media_type não forem fornecidos', async () => {
      mockRequest.body = { favorite: true };
      await userController.addOrUpdateMovie(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'tmdbId e media_type são obrigatórios'
      });
    });

    it('deve retornar 400 se media_type for inválido', async () => {
      mockRequest.body = { tmdbId: 1, media_type: 'invalid', favorite: true };
      await userController.addOrUpdateMovie(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'media_type inválido. Deve ser "movie" ou "tv".'
      });
    });

    it('deve retornar 404 se usuário não for encontrado', async () => {
      User.findById.mockResolvedValue(null);
      mockRequest.body = { tmdbId: 1, media_type: 'movie' };
      await userController.addOrUpdateMovie(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });

    it('deve retornar 500 se user.save falhar', async () => {
      mockRequest.body = { tmdbId: 4, favorite: true, media_type: 'movie' };
      mockUserInstance.save.mockRejectedValue(new Error('fail'));
      await userController.addOrUpdateMovie(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erro interno do servidor ao processar a solicitação de filme.'
      });
    });
  });

  describe('removeMovie', () => {
    it('deve remover um filme da lista', async () => {
      mockRequest.params = { tmdbId: '1' };
      await userController.removeMovie(mockRequest, mockResponse);
      expect(mockUserInstance.movieList.find(m => m.tmdbId === 1)).toBeUndefined();
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Filme removido com sucesso.'
      });
    });

    it('deve retornar 404 se o filme não existir', async () => {
      mockRequest.params = { tmdbId: '999' };
      await userController.removeMovie(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Filme não encontrado na lista do usuário.'
      });
    });

    it('deve retornar 400 se tmdbId não for enviado', async () => {
      mockRequest.params = {};
      await userController.removeMovie(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'tmdbId do filme é obrigatório nos parâmetros da URL.'
      });
    });
  });

  describe('getMovies', () => {
    it('deve retornar a lista de filmes', async () => {
      const mockSelect = jest.fn().mockResolvedValue(mockUserInstance);
      User.findById.mockReturnValue({ select: mockSelect });

      await userController.getMovies(mockRequest, mockResponse);
      expect(mockSelect).toHaveBeenCalledWith('movieList');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUserInstance.movieList);
    });

    it('deve retornar 404 se usuário não for encontrado', async () => {
      const mockSelect = jest.fn().mockResolvedValue(null);
      User.findById.mockReturnValue({ select: mockSelect });

      await userController.getMovies(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });
  });

  describe('getUserProfile', () => {
    it('deve retornar o perfil do usuário', async () => {
      const mockDate = new Date();
      mockUserInstance.createdAt = mockDate;

      const mockSelect = jest.fn().mockResolvedValue(mockUserInstance);
      User.findById.mockReturnValue({ select: mockSelect });

      await userController.getUserProfile(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        name: mockUserInstance.name,
        email: mockUserInstance.email,
        createdAt: mockDate,
        favoriteMoviesCount: 1,
      });
    });

    it('deve retornar 404 se usuário não for encontrado', async () => {
      const mockSelect = jest.fn().mockResolvedValue(null);
      User.findById.mockReturnValue({ select: mockSelect });

      await userController.getUserProfile(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado.' });
    });
  });
});
