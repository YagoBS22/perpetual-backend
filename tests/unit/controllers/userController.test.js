const userController = require('../../../src/controllers/userController');
const User = require('../../../src/models/User');

jest.mock('../../../src/models/User'); // Mock o modelo User

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
        { tmdbId: 1, favorite: true, rating: 5, _id: 'movie1' },
        { tmdbId: 2, favorite: false, rating: 4, _id: 'movie2' },
      ],
      save: jest.fn().mockResolvedValue(true), // Mock da função save
    };

    mockRequest = {
      user: { id: 'mockUserId123' }, // Simula usuário autenticado
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
      mockRequest.body = { tmdbId: 3, favorite: true, rating: 5 };
      await userController.addOrUpdateMovie(mockRequest, mockResponse);

      expect(User.findById).toHaveBeenCalledWith('mockUserId123');
      expect(mockUserInstance.movieList).toContainEqual(expect.objectContaining(mockRequest.body));
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining(mockRequest.body));
    });

    it('deve atualizar um filme existente na lista do usuário', async () => {
      mockRequest.body = { tmdbId: 1, favorite: false, rating: 3 };
      await userController.addOrUpdateMovie(mockRequest, mockResponse);

      const updatedMovie = mockUserInstance.movieList.find(m => m.tmdbId === 1);
      expect(updatedMovie.favorite).toBe(false);
      expect(updatedMovie.rating).toBe(3);
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining(mockRequest.body));
    });

    it('deve retornar 400 se tmdbId não for fornecido', async () => {
      mockRequest.body = { favorite: true };
      await userController.addOrUpdateMovie(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'tmdbId é obrigatório' });
    });

    it('deve retornar 404 se o usuário não for encontrado', async () => {
      User.findById.mockResolvedValue(null);
      mockRequest.body = { tmdbId: 1 };
      await userController.addOrUpdateMovie(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });

     it('deve retornar 500 se user.save() falhar', async () => {
      mockRequest.body = { tmdbId: 4, favorite: true };
      mockUserInstance.save.mockRejectedValue(new Error('DB save error'));
      await userController.addOrUpdateMovie(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Erro interno do servidor ao processar a solicitação de filme.' });
    });
  });

  describe('removeMovie', () => {
    it('deve remover um filme da lista do usuário', async () => {
      mockRequest.params = { tmdbId: '1' };
      await userController.removeMovie(mockRequest, mockResponse);

      expect(mockUserInstance.movieList.find(m => m.tmdbId === 1)).toBeUndefined();
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Filme removido com sucesso.' }));
    });

    it('deve retornar 404 se o filme a ser removido não estiver na lista', async () => {
      mockRequest.params = { tmdbId: '999' };
      await userController.removeMovie(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Filme não encontrado na lista do usuário.' });
    });

    it('deve retornar 400 se tmdbId não for fornecido nos parâmetros', async () => {
        mockRequest.params = { tmdbId: undefined };
        await userController.removeMovie(mockRequest, mockResponse);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'tmdbId do filme é obrigatório nos parâmetros da URL.' });
    });
  });

  describe('getMovies', () => {
    it('deve retornar a lista de filmes do usuário', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUserInstance)
      });
      await userController.getMovies(mockRequest, mockResponse);
      expect(User.findById).toHaveBeenCalledWith('mockUserId123');
      expect(User.findById().select).toHaveBeenCalledWith('movieList');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUserInstance.movieList);
    });

    it('deve retornar 404 se o usuário não for encontrado ao buscar filmes', async () => {
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        });
        await userController.getMovies(mockRequest, mockResponse);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });
  });

  describe('getUserProfile', () => {
    it('deve retornar os dados do perfil do usuário', async () => {
      const mockDate = new Date();
      mockUserInstance.createdAt = mockDate;
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUserInstance)
      });

      await userController.getUserProfile(mockRequest, mockResponse);

      expect(User.findById).toHaveBeenCalledWith('mockUserId123');
      expect(User.findById().select).toHaveBeenCalledWith('name email createdAt movieList');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        name: mockUserInstance.name,
        email: mockUserInstance.email,
        createdAt: mockDate,
        favoriteMoviesCount: mockUserInstance.movieList.filter(m => m.favorite).length,
      });
    });

     it('deve retornar 404 se o usuário não for encontrado para o perfil', async () => {
        User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
        await userController.getUserProfile(mockRequest, mockResponse);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado.' });
    });
  });
});