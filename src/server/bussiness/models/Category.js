const mongoose = require('mongoose');

const categorySchema = require('../schemas/Category');

class Category {
  constructor() {
    this.DbModel = mongoose.model('Category', categorySchema);
  }

  async create(data) {
    const newCategory = new this.DbModel(data);
    const saved = await newCategory.save();
    return saved;
  }

  get(id) {
    if (id)
      return this.DbModel.findById(id);
    return this.DbModel.find({});
  }
}

const categoryModel = new Category();

module.exports = categoryModel;
