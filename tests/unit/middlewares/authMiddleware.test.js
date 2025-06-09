const authMiddleware = require('../../../src/middlewares/authMiddleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;
  const TEST_JWT_SECRET = 'testsecret'; // Use um segredo consistente para testes

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    // Simula process.env.JWT_SECRET para este teste
    process.env.JWT_SECRET = TEST_JWT_SECRET;
  });

  afterEach(() => {
    // Limpa a variável de ambiente mockada se necessário,
    // embora para testes unitários isso seja menos crítico se bem isolado.
    delete process.env.JWT_SECRET;
  });


  it('deve chamar next() com req.user se o token for válido', () => {
    mockRequest.headers.authorization = 'Bearer validtoken123';
    const decodedPayload = {
        "email": "test@example.com",
        "id": "userId",
      }
    jwt.verify.mockReturnValue(decodedPayload);

    authMiddleware(mockRequest, mockResponse, nextFunction);

    expect(jwt.verify).toHaveBeenCalledWith('validtoken123', TEST_JWT_SECRET);
    expect(mockRequest.user).toEqual(decodedPayload);
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('deve retornar 401 se o token não for fornecido', () => {
    authMiddleware(mockRequest, mockResponse, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token não fornecido' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('deve retornar 401 se o formato do token for inválido (sem Bearer)', () => {
    mockRequest.headers.authorization = 'invalidtokenformat';
    authMiddleware(mockRequest, mockResponse, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    // A mensagem de erro exata pode depender de como o split falha,
    // o importante é que seja um erro relacionado ao token.
    // A lógica atual do middleware com `const [, token] = authHeader.split(' ');`
    // e depois `if (!token)` deve capturar isso como "Token mal formatado ou ausente"
    // ou similar, dependendo da verificação `!token`
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Token mal formatado ou ausente' }));
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('deve retornar 401 se o token for apenas "Bearer "', () => {
    mockRequest.headers.authorization = 'Bearer ';
    authMiddleware(mockRequest, mockResponse, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token mal formatado ou ausente' });
    expect(nextFunction).not.toHaveBeenCalled();
  });


  it('deve retornar 401 se o token for inválido (jwt.verify falhar)', () => {
    mockRequest.headers.authorization = 'Bearer invalidtoken123';
    jwt.verify.mockImplementation(() => {
      throw new Error('jwt verify error');
    });

    authMiddleware(mockRequest, mockResponse, nextFunction);

    expect(jwt.verify).toHaveBeenCalledWith('invalidtoken123', TEST_JWT_SECRET);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token inválido' });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});