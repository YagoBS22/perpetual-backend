const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const authRoutes = require('../../../src/routes/authRoutes');
const authService = require('../../../src/services/authService');

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

      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(authService.register).toHaveBeenCalledWith(userData);
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
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      authService.login.mockResolvedValue({ token: 'fakeToken123' });

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(authService.login).toHaveBeenCalledWith(loginData);
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
      // Mock da verificação do JWT
      jwt.verify = jest.fn().mockReturnValue({ id: 'mockUserId' });

      // Middleware simulado para rota protegida
      app.get('/auth/protected', (req, res) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

        const token = authHeader.split(' ')[1];

        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user = decoded;
          return res.status(200).json({ message: 'Acesso autorizado', userId: decoded.id });
        } catch (err) {
          return res.status(401).json({ error: 'Token inválido' });
        }
      });

      const response = await request(app)
        .get('/auth/protected')
        .set('Authorization', 'Bearer validToken');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ message: 'Acesso autorizado', userId: 'mockUserId' });
      expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
    });

    it('deve retornar 401 se nenhum token for fornecido', async () => {
      const response = await request(app).get('/auth/protected');

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error', 'Token não fornecido');
    });

    it('deve retornar 401 para token inválido', async () => {
      jwt.verify = jest.fn(() => {
        throw new Error('jwt malformed');
      });

      const response = await request(app)
        .get('/auth/protected')
        .set('Authorization', 'Bearer invalidToken');

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error', 'Token inválido');
    });
  });
});
