const request = require('supertest');
const express = require('express');
const authRoutes = require('../../../src/routes/authRoutes');
const authService = require('../../../src/services/authService');
const appInstance = require('../../../src/app');
const jwt = require('jsonwebtoken'); // Para mockar jwt.verify na rota protegida

jest.mock('../../../src/services/authService');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'testsecret';
  });

  describe('POST /auth/register (com app mockando serviço)', () => {
    it('deve registrar um novo usuário com sucesso e retornar 201', async () => {
      authService.register.mockResolvedValue({ message: 'Usuário registrado com sucesso' });
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ message: 'Usuário registrado com sucesso' });
    });

    it('deve retornar 400 para dados de registro inválidos', async () => {
      authService.register.mockRejectedValue(new Error('Dados inválidos'));
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Test User' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Dados inválidos');
    });
  });

  describe('POST /auth/login (com app mockando serviço)', () => {
    it('deve logar o usuário e retornar um token com status 200', async () => {
      authService.login.mockResolvedValue({ token: 'fakeLoginToken123' });
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ token: 'fakeLoginToken123' });
    });

    it('deve retornar 401 para credenciais de login inválidas', async () => {
      authService.login.mockRejectedValue(new Error('Credenciais inválidas'));
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Credenciais inválidas');
    });
  });

  describe('GET /auth/protected (com instância real do app e mock de jwt.verify)', () => {
    let originalVerify;
    beforeEach(() => {
      originalVerify = jwt.verify;
    });
    afterEach(() => {
      jwt.verify = originalVerify;
    });

    it('deve permitir acesso com um token válido', async () => {
      jwt.verify = jest.fn().mockReturnValue({ id: 'userId123' });

      const res = await request(appInstance)
        .get('/auth/protected')
        .set('Authorization', 'Bearer validtoken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Acesso autorizado' });
      expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET);
    });

    it('deve retornar 401 se nenhum token for fornecido', async () => {
      const res = await request(appInstance)
        .get('/auth/protected');
      expect(res.statusCode).toBe(401);
      // Corrija para a mensagem padronizada do seu middleware:
      expect(res.body).toHaveProperty('error');
      // Se possível, confira se a mensagem é igual à esperada:
      // expect(res.body.error).toBe('Token não fornecido');
    });

    it('deve retornar 401 para um token inválido (jwt.verify lança erro)', async () => {
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      const res = await request(appInstance)
        .get('/auth/protected')
        .set('Authorization', 'Bearer invalidtoken');
      expect(res.statusCode).toBe(401);
      // Corrija para a mensagem padronizada do seu middleware:
      expect(res.body).toHaveProperty('error');
      // Se possível, confira se a mensagem é igual à esperada:
      // expect(res.body.error).toBe('Token inválido');
    });
  });
});