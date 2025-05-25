const authService = require('../services/authService');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    res.status(201).json(result);
  } catch (error) {
    const statusCode = error.status || 400;
    res.status(statusCode).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    const statusCode = error.status || 401;
    res.status(statusCode).json({ error: error.message });
  }
};

const protectedRoute = (req, res) => {
  res.status(200).json({ message: 'Acesso autorizado', userId: req.user.id });
};

module.exports = { register, login, protectedRoute };