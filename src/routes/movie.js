const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const movieController = require('../controllers/movieController');

router.use(authMiddleware);

router.post('/', movieController.createMovie);
router.get('/', movieController.getMovies);
router.get('/:id', movieController.getMovieById);
router.put('/:id', movieController.updateMovie);
router.patch('/:id', movieController.partialUpdateMovie);
router.delete('/:id', movieController.deleteMovie);

module.exports = router;