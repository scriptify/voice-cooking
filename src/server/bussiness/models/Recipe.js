const mongoose = require('mongoose');

const recipeSchema = require('../schemas/Recipe');

class Recipe {
  constructor() {
    this.DbModel = mongoose.model('Recipe', recipeSchema);
  }

  async create(data) {
    const newRecipe = new this.DbModel(data);
    await newRecipe.save();
    return newRecipe;
  }

  get({ id, categoryId }) {
    if (id)
      return this.DbModel.findById(id);
    if (categoryId)
      return this.DbModel.find({ categories: categoryId });

    return this.DbModel.find({});
  }
}

const recipeModel = new Recipe();

module.exports = recipeModel;
