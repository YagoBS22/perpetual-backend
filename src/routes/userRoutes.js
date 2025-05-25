const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/user/movies', authenticateToken, userController.addOrUpdateMovie);
router.get('/user/movies', authenticateToken, userController.getMovies);
router.delete('/user/movies/:tmdbId', authenticateToken, userController.removeMovie);

router.get('/user/profile', authenticateToken, userController.getUserProfile);

module.exports = router;
