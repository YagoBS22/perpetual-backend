const request = require('supertest');
const express = require('express');
const userRoutes = require('../../../src/routes/userRoutes');
const User = require('../../../src/models/User');
// Não precisamos mockar authMiddleware aqui, pois o teste de integração deve usar o middleware real
// em conjunto com um token válido (ou mockar jwt.verify se não quisermos gerar tokens reais)

// Para simplificar, vamos mockar jwt.verify para controlar o resultado da autenticação
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');


const app = express();
app.use(express.json());
// Para que as rotas de usuário funcionem, o middleware de autenticação real precisa ser chamado.
// O middleware authMiddleware é importado e usado em userRoutes.js implicitamente
// se as rotas lá o utilizarem. No nosso caso, userRoutes.js usa 'authenticateToken'
// que é o authMiddleware.js
const actualAuthMiddleware = require('../../../src/middlewares/authMiddleware'); //

// Re-aplicamos o prefixo /api como no index.js
app.use('/api', userRoutes);


describe('User MovieList Routes (Integration)', () => {
  let mockUserInstance;
  let mockUserMovieList;
  const MOCK_USER_ID = 'mockUserIdForUserRoutes';
  const MOCK_VALID_TOKEN = 'mockValidToken';

  beforeEach(() => {
    jest.clearAllMocks();
    // Configura o mock do jwt.verify
    jwt.verify.mockImplementation((token, secret, callback) => {
        if (token === MOCK_VALID_TOKEN && secret === process.env.JWT_SECRET) {
            return { id: MOCK_USER_ID }; // Payload decodificado
        }
        // Para outros tokens ou se o segredo não bater, lança erro (ou retorna undefined)
        throw new Error('Invalid token');
    });


    mockUserMovieList = [
      { tmdbId: 1, favorite: true, rating: 5, _id: 'movie1' },
      { tmdbId: 2, favorite: false, rating: 4, _id: 'movie2' },
    ];
    mockUserInstance = {
      _id: MOCK_USER_ID,
      name: 'Mock User',
      email: 'mock@example.com',
      movieList: [...mockUserMovieList], // Clona para evitar modificações entre testes
      createdAt: new Date().toISOString(),
      save: jest.fn().mockImplementation(function() { // this refere-se à instância
          return Promise.resolve(this);
      }),
      // Adiciona .select se o controller usar (como em getMovies e getUserProfile)
      select: jest.fn().mockReturnThis(), // Para encadear .select().exec() ou .select().then()
    };

    // Mock para User.findById().select()
    User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUserInstance) // Para getMovies, getUserProfile
    });
    // Mock direto para User.findById() para rotas que não usam .select() explicitamente após findById
    // ou se User.findById é chamado e depois a instância é usada.
    // Ajuste: User.findById deve retornar o objeto que tem o método save.
    User.findById.mockResolvedValue(mockUserInstance);
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
        jwt.verify.mockImplementation(() => { throw new Error('jwt verify error'); }); // Garante que o middleware falhe
        const res = await request(app)
            .post('/api/user/movies')
            .send({ tmdbId: 3, favorite: true });
        expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/user/movies', () => {
    it('deve retornar a lista de filmes com token válido', async () => {
      // Garante que User.findById().select() retorne a instância correta
      User.findById.mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUserInstance)
      });

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
        // Garante que User.findById().select() retorne a instância correta para o perfil
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUserInstance)
        });

        const res = await request(app)
            .get('/api/user/profile')
            .set('Authorization', `Bearer ${MOCK_VALID_TOKEN}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('name', mockUserInstance.name);
        expect(res.body).toHaveProperty('favoriteMoviesCount', mockUserInstance.movieList.filter(m => m.favorite).length);
    });
  });
});