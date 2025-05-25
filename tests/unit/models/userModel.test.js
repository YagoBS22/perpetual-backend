const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../../src/models/User');
const bcrypt = require('bcrypt');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
    // Limpa a coleção de usuários após cada teste
    await User.deleteMany({});
});

describe('User Model', () => {
  it('deve criar e salvar um usuário com sucesso com campos obrigatórios', async () => {
    const userData = { name: 'Test User', email: 'test@example.com', password: 'password123' };
    const validUser = new User(userData);
    const savedUser = await validUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.createdAt).toBeDefined(); // Por causa do timestamps: true
  });

  it('deve fazer hash da senha antes de salvar', async () => {
    const userData = { name: 'Hash Test', email: 'hash@example.com', password: 'plainPassword' };
    const user = new User(userData);
    await user.save();
    expect(user.password).toBeDefined();
    expect(user.password).not.toBe('plainPassword');
    const isMatch = await bcrypt.compare('plainPassword', user.password);
    expect(isMatch).toBe(true);
  });

  it('deve falhar ao salvar sem campo obrigatório "name"', async () => {
    const userData = { email: 'noname@example.com', password: 'password123' };
    const user = new User(userData);
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.name).toBeDefined();
  });

  it('deve falhar ao salvar sem campo obrigatório "email"', async () => {
    const userData = { name: 'No Email', password: 'password123' };
    const user = new User(userData);
    let err;
    try {
        await user.save();
    } catch (error) {
        err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.email).toBeDefined();
  });


  it('deve falhar ao salvar com email duplicado', async () => {
    const userData1 = { name: 'User One', email: 'duplicate@example.com', password: 'password123' };
    await new User(userData1).save();

    const userData2 = { name: 'User Two', email: 'duplicate@example.com', password: 'password456' };
    const user2 = new User(userData2);
    let err;
    try {
      await user2.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    // O Mongoose pode lançar um erro com código 11000 para duplicidade
    expect(err.code).toBe(11000);
  });

  describe('User MovieList Subdocument', () => {
    it('deve adicionar um filme à movieList com sucesso', async () => {
        const userData = { name: 'Movie List User', email: 'movielist@example.com', password: 'password123' };
        const user = new User(userData);
        user.movieList.push({ tmdbId: 123, favorite: true, rating: 9 });
        const savedUser = await user.save();

        expect(savedUser.movieList).toHaveLength(1);
        expect(savedUser.movieList[0].tmdbId).toBe(123);
        expect(savedUser.movieList[0].favorite).toBe(true);
        expect(savedUser.movieList[0].rating).toBe(9);
    });

    it('deve requerer tmdbId para itens na movieList', async () => {
        const userData = { name: 'Movie List User 2', email: 'movielist2@example.com', password: 'password123' };
        const user = new User(userData);
        // Tenta adicionar sem tmdbId
        user.movieList.push({ favorite: true });
        let err;
        try {
            await user.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors['movieList.0.tmdbId']).toBeDefined();
    });
     it('deve usar valor default para favorite (false) se não fornecido', async () => {
        const userData = { name: 'Movie List User 3', email: 'movielist3@example.com', password: 'password123' };
        const user = new User(userData);
        user.movieList.push({ tmdbId: 789 }); // favorite não fornecido
        const savedUser = await user.save();
        expect(savedUser.movieList[0].favorite).toBe(false);
    });
  });
});