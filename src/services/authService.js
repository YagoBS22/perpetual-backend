const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  return typeof password === 'string' && password.trim().length >= 6;
};

const register = async (name, email, password) => {
  if (!name || !email || !password) {
    const missing = [];
    if (!name) missing.push("name");
    if (!email) missing.push("email");
    if (!password) missing.push("password");
    const message = `Campos obrigatórios faltando: ${missing.join(', ')}`;
    const err = new Error(message);
    err.status = 400;
    throw err;
  }

  if (!isValidEmail(email)) {
    const err = new Error('Email inválido');
    err.status = 400;
    throw err;
  }

  if (!isValidPassword(password)) {
    const err = new Error('Senha inválida (mínimo de 6 caracteres)');
    err.status = 400;
    throw err;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error('E-mail já registrado');
    err.status = 409;
    throw err;
  }

  const user = new User({ name, email, password });
  await user.save();
  return { message: 'Usuário registrado com sucesso' };
};

const login = async (email, password) => {
  if (!email || !password) {
    const err = new Error('Email e senha são obrigatórios');
    err.status = 400;
    throw err;
  }

  if (!isValidEmail(email)) {
    const err = new Error('Email inválido');
    err.status = 400;
    throw err;
  }

  if (!isValidPassword(password)) {
    const err = new Error('Senha inválida (mínimo de 6 caracteres)');
    err.status = 400;
    throw err;
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET não está definido!");
    const err = new Error('Erro de configuração interna do servidor.');
    err.status = 500;
    throw err;
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  return { token };
};

module.exports = { register, login };