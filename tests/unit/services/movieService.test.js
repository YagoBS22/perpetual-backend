// perpetual-project/perpetual-backend/tests/unit/services/movieService.test.js
const movieService = require('../../../src/services/movieService');
const Movie = require('../../../src/models/Movie');

jest.mock('../../../src/models/Movie');

describe('MovieService', () => {
    const mockOwnerId = 'owner123';
    const mockMovieData = { title: 'Test Movie', genre: 'Test Genre', releaseYear: 2023, rating: 8 };
    const mockMovieId = 'movie123';

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock para o construtor e save
        Movie.prototype.save = jest.fn().mockResolvedValue({ ...mockMovieData, owner: mockOwnerId, _id: mockMovieId });
    });

    describe('create', () => {
        it('deve criar e salvar um novo filme', async () => {
            const result = await movieService.create(mockMovieData, mockOwnerId);
            expect(Movie.prototype.save).toHaveBeenCalled();
            expect(result.title).toBe(mockMovieData.title);
            expect(result.owner).toBe(mockOwnerId);
        });
    });

    describe('getAllByUser', () => {
        it('deve retornar todos os filmes de um usuário', async () => {
            const mockMovies = [{ ...mockMovieData, owner: mockOwnerId, _id: mockMovieId }];
            Movie.find.mockResolvedValue(mockMovies);
            const result = await movieService.getAllByUser(mockOwnerId);
            expect(Movie.find).toHaveBeenCalledWith({ owner: mockOwnerId });
            expect(result).toEqual(mockMovies);
        });
    });

    describe('getByIdAndUser', () => {
        it('deve retornar um filme se encontrado e pertencer ao usuário', async () => {
            const mockMovie = { ...mockMovieData, owner: mockOwnerId, _id: mockMovieId };
            Movie.findOne.mockResolvedValue(mockMovie);
            const result = await movieService.getByIdAndUser(mockMovieId, mockOwnerId);
            expect(Movie.findOne).toHaveBeenCalledWith({ _id: mockMovieId, owner: mockOwnerId });
            expect(result).toEqual(mockMovie);
        });
        it('deve retornar null se o filme não for encontrado', async () => {
            Movie.findOne.mockResolvedValue(null);
            const result = await movieService.getByIdAndUser('nonExistentId', mockOwnerId);
            expect(result).toBeNull();
        });
    });

    describe('updateByIdAndUser', () => {
        it('deve atualizar e retornar o filme atualizado', async () => {
            const updateData = { title: 'Updated Movie Title' };
            const updatedMovie = { ...mockMovieData, ...updateData, owner: mockOwnerId, _id: mockMovieId };
            Movie.findOneAndUpdate.mockResolvedValue(updatedMovie);

            const result = await movieService.updateByIdAndUser(mockMovieId, mockOwnerId, updateData);
            expect(Movie.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: mockMovieId, owner: mockOwnerId },
                updateData,
                { new: true, runValidators: true }
            );
            expect(result).toEqual(updatedMovie);
        });
    });

    describe('partialUpdateByIdAndUser', () => {
         it('deve atualizar parcialmente e retornar o filme atualizado', async () => {
            const partialUpdateData = { rating: 9 };
            const updatedMovie = { ...mockMovieData, ...partialUpdateData, owner: mockOwnerId, _id: mockMovieId };
            Movie.findOneAndUpdate.mockResolvedValue(updatedMovie);
            const result = await movieService.partialUpdateByIdAndUser(mockMovieId, mockOwnerId, partialUpdateData);
             expect(Movie.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: mockMovieId, owner: mockOwnerId },
                { $set: partialUpdateData },
                { new: true, runValidators: true }
            );
            expect(result).toEqual(updatedMovie);
        });
    });


    describe('deleteByIdAndUser', () => {
        it('deve deletar e retornar o filme deletado', async () => {
            const deletedMovie = { ...mockMovieData, owner: mockOwnerId, _id: mockMovieId };
            Movie.findOneAndDelete.mockResolvedValue(deletedMovie);
            const result = await movieService.deleteByIdAndUser(mockMovieId, mockOwnerId);
            expect(Movie.findOneAndDelete).toHaveBeenCalledWith({ _id: mockMovieId, owner: mockOwnerId });
            expect(result).toEqual(deletedMovie);
        });
    });
});