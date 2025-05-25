const authService = require('../../../src/services/authService');
const User = require('../../../src/models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../../../src/models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.prototype.save = jest.fn().mockResolvedValue(true);
    // Garante que JWT_SECRET esteja definido para os testes
    process.env.JWT_SECRET = 'testsecret';
  });

  describe('login', () => {
    it('deve retornar um token para credenciais válidas', async () => {
      const mockUser = {
        _id: 'userId123',
        email: 'test@example.com',
        password: 'hashedPassword123',
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('fakeToken123');

      const result = await authService.login('test@example.com', 'password123');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
      expect(jwt.sign).toHaveBeenCalledWith({ id: 'userId123' }, 'testsecret', { expiresIn: '1h' });
      expect(result).toEqual({ token: 'fakeToken123' });
    });

    it('deve lançar erro para email não encontrado', async () => {
      User.findOne.mockReturnValue({
          select: jest.fn().mockResolvedValue(null)
      });
      await expect(authService.login('wrong@example.com', 'password123'))
        .rejects.toThrow('Credenciais inválidas');
    });

    it('deve lançar erro para senha incorreta', async () => {
      const mockUser = {
        _id: 'userId123',
        email: 'test@example.com',
        password: 'hashedPassword123',
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      bcrypt.compare.mockResolvedValue(false);
      await expect(authService.login('test@example.com', 'wrongPassword'))
        .rejects.toThrow('Credenciais inválidas');
    });

     it('deve lançar erro para email ou senha faltando', async () => {
      await expect(authService.login('', 'password'))
        .rejects.toThrow('Email e senha são obrigatórios');
      await expect(authService.login('email@test.com', ''))
        .rejects.toThrow('Email e senha são obrigatórios');
    });

    it('deve lançar erro para email inválido', async () => {
      await expect(authService.login('invalid-email', 'password'))
        .rejects.toThrow('Email inválido');
    });

     it('deve lançar erro para senha inválida (curta)', async () => {
      await expect(authService.login('valid@email.com', '123'))
        .rejects.toThrow('Senha inválida (mínimo de 6 caracteres)');
    });
  });

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedNewPassword');

      const result = await authService.register('New User', 'new@example.com', 'newPassword123');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'new@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(User.prototype.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Usuário registrado com sucesso' });
    });

    it('deve lançar erro se o e-mail já existir', async () => {
      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await expect(authService.register('Another User', 'existing@example.com', 'password123'))
        .rejects.toThrow('E-mail já registrado');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(User.prototype.save).not.toHaveBeenCalled();
    });

    it('deve lançar erro se o nome estiver faltando', async () => {
      await expect(authService.register(null, 'test@example.com', 'password123'))
        .rejects.toThrow('Campos obrigatórios faltando: name');
    });

    it('deve lançar erro se o email estiver faltando', async () => {
        await expect(authService.register('Test User', null, 'password123'))
          .rejects.toThrow('Campos obrigatórios faltando: email');
    });

    it('deve lançar erro se a senha estiver faltando', async () => {
        await expect(authService.register('Test User', 'test@example.com', null))
          .rejects.toThrow('Campos obrigatórios faltando: password');
    });

    it('deve lançar erro para e-mail inválido no registro', async () => {
      await expect(authService.register('Test User', 'invalid-email', 'password123'))
        .rejects.toThrow('Email inválido');
    });

    it('deve lançar erro para senha inválida (curta) no registro', async () => {
      await expect(authService.register('Test User', 'valid@email.com', '123'))
        .rejects.toThrow('Senha inválida (mínimo de 6 caracteres)');
    });
  });
});