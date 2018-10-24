const mongoose = require('mongoose');

const dietSchema = require('../schemas/Diet');

class Diet {
  constructor() {
    this.DbModel = mongoose.model('Diet', dietSchema);
  }

  async create(data) {
    const newDiet = new this.DbModel(data);
    await newDiet.save();
    return newDiet;
  }

  get(id) {
    if (id)
      return this.DbModel.findById(id);
    return this.DbModel.find({});
  }
}

const dietModel = new Diet();

module.exports = dietModel;