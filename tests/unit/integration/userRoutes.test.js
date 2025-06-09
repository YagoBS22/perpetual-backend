const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const userRoutes = require('../../../src/routes/userRoutes');
const User = require('../../../src/models/User');

jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/api', userRoutes);

describe('User MovieList Routes (Integration)', () => {
  const MOCK_USER_ID = 'mockUserIdForUserRoutes';
  const MOCK_VALID_TOKEN = 'mockValidToken';

  let mockUserInstance;
  let mockUserMovieList;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'testsecret';

    // Simula verificação de JWT bem-sucedida
    jwt.verify.mockImplementation((token, secret) => {
      if (token === MOCK_VALID_TOKEN && secret === process.env.JWT_SECRET) {
        return { id: MOCK_USER_ID };
      }
      throw new Error('Invalid token');
    });

    // Lista de filmes do usuário
    mockUserMovieList = [
      { tmdbId: 1, favorite: true, rating: 5, _id: 'movie1' },
      { tmdbId: 2, favorite: false, rating: 4, _id: 'movie2' },
    ];

    // Instância mockada de um usuário
    mockUserInstance = {
      _id: MOCK_USER_ID,
      name: 'Mock User',
      email: 'mock@example.com',
      movieList: [...mockUserMovieList],
      createdAt: new Date().toISOString(),
      save: jest.fn().mockResolvedValue(mockUserInstance),
      select: jest.fn().mockReturnThis(), // usado se for chamado .select().save()
    };

    // Mock do User.findById
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUserInstance),
      then: jest.fn((cb) => cb(mockUserInstance)), // fallback para chamadas .then()
    });
  });

  describe('POST /api/user/movies', () => {
    it('deve adicionar um filme à lista com token válido', async () => {
      const newMovie = { tmdbId: 3, favorite: true, rating: 5 };

      const res = await request(app)
        .post('/api/user/movies')
        .set('Authorization', `Bearer ${MOCK_VALID_TOKEN}`)
        .send(newMovie);

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject(newMovie);
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(mockUserInstance.movieList).toEqual(
        expect.arrayContaining([expect.objectContaining(newMovie)])
      );
    });

    it('deve retornar 401 sem token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('jwt verify error');
      });

      const res = await request(app)
        .post('/api/user/movies')
        .send({ tmdbId: 3, favorite: true });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/user/movies', () => {
    it('deve retornar a lista de filmes com token válido', async () => {
      const res = await request(app)
        .get('/api/user/movies')
        .set('Authorization', `Bearer ${MOCK_VALID_TOKEN}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockUserMovieList);
    });
  });

  describe('DELETE /api/user/movies/:tmdbId', () => {
    it('deve remover um filme com token válido', async () => {
      const tmdbIdToRemove = 1;

      const res = await request(app)
        .delete(`/api/user/movies/${tmdbIdToRemove}`)
        .set('Authorization', `Bearer ${MOCK_VALID_TOKEN}`);

      expect(res.statusCode).toBe(200);
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(mockUserInstance.movieList.find(m => m.tmdbId === tmdbIdToRemove)).toBeUndefined();
    });
  });

  describe('GET /api/user/profile', () => {
    it('deve retornar o perfil do usuário com token válido', async () => {
      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${MOCK_VALID_TOKEN}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name', mockUserInstance.name);
      expect(res.body).toHaveProperty(
        'favoriteMoviesCount',
        mockUserInstance.movieList.filter(m => m.favorite).length
      );
    });
  });
});
