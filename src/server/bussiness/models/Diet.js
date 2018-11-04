const mongoose = require('mongoose');

const dietSchema = require('../schemas/Diet');

class Diet {
  constructor() {
    this.DbModel = mongoose.model('Diet', dietSchema);
  }

  async create(data) {
    const newDiet = new this.DbModel(data);
    const saved = await newDiet.save();
    return saved;
  }

  get(id) {
    if (id)
      return this.DbModel.findById(id);
    return this.DbModel.find({});
  }
}

const dietModel = new Diet();

module.exports = dietModel;
