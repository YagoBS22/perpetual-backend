const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userMovieItemSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true },
  rating: { type: Number, default: null, min: 0, max: 10 },
  favorite: { type: Boolean, default: false },
  media_type: { type: String, required: true, enum: ['movie', 'tv'] }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  movieList: [userMovieItemSchema]
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);