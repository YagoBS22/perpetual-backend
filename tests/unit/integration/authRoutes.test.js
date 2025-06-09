const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const authRoutes = require('../../../src/routes/authRoutes');
const authService = require('../../../src/services/authService');
const appInstance = require('../../../src/app');

jest.mock('../../../src/services/authService');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'testsecret';
  });

  describe('POST /auth/register', () => {
    it('deve registrar um novo usuário com sucesso e retornar 201', async () => {
      authService.register.mockResolvedValue({ message: 'Usuário registrado com sucesso' });

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(authService.register).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({ message: 'Usuário registrado com sucesso' });
    });

    it('deve retornar 400 para dados inválidos', async () => {
      authService.register.mockRejectedValue(new Error('Dados inválidos'));

      const response = await request(app)
        .post('/auth/register')
        .send({ name: 'Test User' }); // faltando email e senha

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error', 'Dados inválidos');
    });
  });

  describe('POST /auth/login', () => {
    it('deve retornar token válido com status 200', async () => {
      authService.login.mockResolvedValue({ token: 'fakeToken123' });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ token: 'fakeToken123' });
    });

    it('deve retornar 401 para credenciais inválidas', async () => {
      authService.login.mockRejectedValue(new Error('Credenciais inválidas'));

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error', 'Credenciais inválidas');
    });
  });

  describe('GET /auth/protected', () => {
    let originalVerify;

    beforeEach(() => {
      originalVerify = jwt.verify;
    });

    afterEach(() => {
      jwt.verify = originalVerify;
    });

    it('deve permitir acesso com token válido', async () => {
      jwt.verify = jest.fn().mockReturnValue({ id: 'mockUserId' });

      const response = await request(appInstance)
        .get('/auth/protected')
        .set('Authorization', 'Bearer validToken');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ message: 'Acesso autorizado' });
      expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
    });

    it('deve retornar 401 se nenhum token for fornecido', async () => {
      const response = await request(appInstance).get('/auth/protected');

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error', 'Token não fornecido');
    });

    it('deve retornar 401 para token inválido', async () => {
      jwt.verify = jest.fn(() => {
        throw new Error('jwt malformed');
      });

      const response = await request(appInstance)
        .get('/auth/protected')
        .set('Authorization', 'Bearer invalidToken');

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error', 'Token inválido');
    });
  });
});
