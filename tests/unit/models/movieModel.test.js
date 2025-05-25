// perpetual-project/perpetual-backend/tests/unit/models/movieModel.test.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Movie = require('../../../src/models/Movie'); //

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
    await Movie.deleteMany({});
});

describe('Movie Model', () => {
  const ownerId = new mongoose.Types.ObjectId(); // Gera um ObjectId válido para owner

  it('deve criar e salvar um filme com sucesso com campos obrigatórios', async () => {
    const movieData = { title: 'Interstellar', owner: ownerId, releaseYear: 2014, genre: 'Sci-Fi', rating: 9.5 };
    const validMovie = new Movie(movieData);
    const savedMovie = await validMovie.save();

    expect(savedMovie._id).toBeDefined();
    expect(savedMovie.title).toBe(movieData.title);
    expect(savedMovie.owner.toString()).toBe(ownerId.toString()); // Compara como string
    expect(savedMovie.releaseYear).toBe(movieData.releaseYear);
    expect(savedMovie.createdAt).toBeDefined();
    expect(savedMovie.updatedAt).toBeDefined();
  });

  it('deve falhar ao salvar sem campo obrigatório "title"', async () => {
    const movieData = { owner: ownerId };
    const movie = new Movie(movieData);
    let err;
    try {
      await movie.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.title).toBeDefined();
  });

  it('deve falhar ao salvar sem campo obrigatório "owner"', async () => {
    const movieData = { title: 'Movie Without Owner' };
    const movie = new Movie(movieData);
    let err;
    try {
        await movie.save();
    } catch (error) {
        err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.owner).toBeDefined();
  });

  it('deve falhar se rating for menor que 0', async () => {
    const movieData = { title: 'Low Rating', owner: ownerId, rating: -1 };
    const movie = new Movie(movieData);
    let err;
    try {
        await movie.save();
    } catch (error) {
        err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.rating).toBeDefined();
  });

  it('deve falhar se rating for maior que 10', async () => {
    const movieData = { title: 'High Rating', owner: ownerId, rating: 11 };
    const movie = new Movie(movieData);
    let err;
    try {
        await movie.save();
    } catch (error) {
        err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.rating).toBeDefined();
  });
});