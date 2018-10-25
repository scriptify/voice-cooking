function prepareId(obj) {
  if (!obj._id)
    return obj;
  const objToDestructure = obj._doc ? obj._doc : obj;

  return {
    ...objToDestructure,
    _id: obj._id.toString()
  };
}

module.exports = {
  Query: {
    recipe: async (parent, { id }, { models }) => {
      const recipe = await models.recipe.get({ id });
      return prepareId(recipe);
    },
    recipes: async (parent, { categoryId }, { models }) => {
      const recipes = await models.recipe.get({ categoryId });
      return prepareId(recipes);
    },
    category: async (parent, { id }, { models }) => {
      const category = await models.category.get(id);
      return prepareId(category);
    },
    categories: async (parent, params, { models }) => {
      const categories = await models.category.get();
      return prepareId(categories);
    },
  },
  Mutation: {
    recipeCreate: async (parent, { data }, { models }) => {
      const recipe = await models.recipe.create(data);
      return prepareId(recipe);
    },
    categoryCreate: async (parent, { data }, { models }) => {
      const category = await models.category.create(data);
      return prepareId(category);
    }
  }
};
