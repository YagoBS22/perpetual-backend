// perpetual-project/perpetual-backend/tests/integration/movieRoutes.test.js
const request = require('supertest');
const express = require('express');
const movieRoutes = require('../../../src/routes/movie'); // Ajuste o caminho
const movieService = require('../../../src/services/movieService'); //
// Mock o middleware de autenticação real
// auth.js é o nome do arquivo no seu src/middlewares
const authMiddlewareOriginal = require('../../../src/middlewares/auth'); //

jest.mock('../../../src/services/movieService');
// Não mockaremos o authMiddleware aqui, vamos testar a rota com um token válido (ou mockar jwt.verify)
// Para testes de integração mais puros, você pode gerar um token válido.
// Para simplificar, vamos mockar a parte interna do authMiddleware se necessário, ou o req.user.
// A forma mais simples é mockar o middleware para sempre passar e adicionar req.user.
jest.mock('../../../src/middlewares/auth', () => jest.fn((req, res, next) => {
    req.user = { id: 'mockUserIdForMovieRoutes' }; // Simula usuário autenticado
    next();
}));


const app = express();
app.use(express.json());
app.use('/movies', movieRoutes); // Monta as rotas de filme

describe('Movie Routes', () => {
    const mockMovie = { _id: 'movieId1', title: 'Inception', owner: 'mockUserIdForMovieRoutes' };
    const moviePayload = { title: 'Inception', genre: 'Sci-Fi', releaseYear: 2010, rating: 9 };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /movies', () => {
        it('deve criar um filme e retornar 201', async () => {
            movieService.create.mockResolvedValue({ ...mockMovie, ...moviePayload });
            const res = await request(app)
                .post('/movies')
                .send(moviePayload);
            expect(res.statusCode).toBe(201);
            expect(res.body.title).toBe(moviePayload.title);
            expect(movieService.create).toHaveBeenCalledWith(moviePayload, 'mockUserIdForMovieRoutes');
        });
        it('deve retornar 400 se o título estiver faltando', async () => {
            // O controller movieController.js já faz essa validação
            const res = await request(app)
                .post('/movies')
                .send({ genre: 'Test' }); // Sem título
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'Título é obrigatório');
        });
    });

    describe('GET /movies', () => {
        it('deve retornar uma lista de filmes e status 200', async () => {
            const mockMovieList = [mockMovie];
            movieService.getAllByUser.mockResolvedValue(mockMovieList);
            const res = await request(app).get('/movies');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockMovieList);
            expect(movieService.getAllByUser).toHaveBeenCalledWith('mockUserIdForMovieRoutes');
        });
    });

    describe('GET /movies/:id', () => {
        it('deve retornar um filme específico e status 200', async () => {
            movieService.getByIdAndUser.mockResolvedValue(mockMovie);
            const res = await request(app).get(`/movies/${mockMovie._id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockMovie);
            expect(movieService.getByIdAndUser).toHaveBeenCalledWith(mockMovie._id, 'mockUserIdForMovieRoutes');
        });
        it('deve retornar 404 se o filme não for encontrado', async () => {
            movieService.getByIdAndUser.mockResolvedValue(null);
            const res = await request(app).get('/movies/nonexistentid');
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', 'Filme não encontrado');
        });
    });

    describe('PUT /movies/:id', () => {
        it('deve atualizar um filme e retornar 200', async () => {
            const updatedData = { title: 'Inception Updated' };
            movieService.updateByIdAndUser.mockResolvedValue({ ...mockMovie, ...updatedData });
            const res = await request(app)
                .put(`/movies/${mockMovie._id}`)
                .send(updatedData);
            expect(res.statusCode).toBe(200);
            expect(res.body.title).toBe('Inception Updated');
            expect(movieService.updateByIdAndUser).toHaveBeenCalledWith(mockMovie._id, 'mockUserIdForMovieRoutes', updatedData);
        });
    });
     describe('PATCH /movies/:id', () => {
        it('deve atualizar parcialmente um filme e retornar 200', async () => {
            const partialData = { rating: 10 };
            movieService.partialUpdateByIdAndUser.mockResolvedValue({ ...mockMovie, ...partialData });
            const res = await request(app)
                .patch(`/movies/${mockMovie._id}`)
                .send(partialData);
            expect(res.statusCode).toBe(200);
            expect(res.body.rating).toBe(10);
             expect(movieService.partialUpdateByIdAndUser).toHaveBeenCalledWith(mockMovie._id, 'mockUserIdForMovieRoutes', partialData);
        });
    });

    describe('DELETE /movies/:id', () => {
        it('deve deletar um filme e retornar 200 com mensagem', async () => {
            movieService.deleteByIdAndUser.mockResolvedValue(mockMovie); // Simula que o filme foi encontrado e deletado
            const res = await request(app).delete(`/movies/${mockMovie._id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Filme excluído com sucesso');
            expect(movieService.deleteByIdAndUser).toHaveBeenCalledWith(mockMovie._id, 'mockUserIdForMovieRoutes');
        });
         it('deve retornar 404 se o filme a ser deletado não for encontrado', async () => {
            movieService.deleteByIdAndUser.mockResolvedValue(null);
            const res = await request(app).delete('/movies/nonexistentidfordelete');
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', 'Filme não encontrado');
        });
    });
});