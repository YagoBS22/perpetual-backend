const Movie = require('../models/Movie');

exports.create = async (data, ownerId) => {
  const movie = new Movie({ ...data, owner: ownerId });
  return await movie.save();
};

exports.getAllByUser = async (ownerId) => {
  return await Movie.find({ owner: ownerId });
};

exports.getByIdAndUser = async (id, ownerId) => {
  return await Movie.findOne({ _id: id, owner: ownerId });
};

exports.updateByIdAndUser = async (id, ownerId, data) => {
  return await Movie.findOneAndUpdate(
    { _id: id, owner: ownerId },
    data,
    { new: true, runValidators: true }
  );
};

exports.partialUpdateByIdAndUser = async (id, ownerId, data) => {
  return await Movie.findOneAndUpdate(
    { _id: id, owner: ownerId },
    { $set: data },
    { new: true, runValidators: true }
  );
};

exports.deleteByIdAndUser = async (id, ownerId) => {
  return await Movie.findOneAndDelete({ _id: id, owner: ownerId });
};
