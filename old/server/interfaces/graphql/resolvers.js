function prepare(obj) {
  if (!obj._id) {
    if (Array.isArray(obj)) {
      const array = obj;
      return array.map(currObj => prepare(currObj));
    }
    return obj;
  }
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
      return prepare(recipe);
    },
    recipes: async (parent, { categoryId }, { models }) => {
      const recipes = await models.recipe.get({ categoryId });
      return prepare(recipes);
    },
    category: async (parent, { id }, { models }) => {
      const category = await models.category.get(id);
      return prepare(category);
    },
    categories: async (parent, params, { models }) => {
      const categories = await models.category.get();
      return prepare(categories);
    },
  },
  Mutation: {
    recipeCreate: async (parent, { data }, { models }) => {
      const recipe = await models.recipe.create(data);
      return prepare(recipe);
    },
    categoryCreate: async (parent, { data }, { models }) => {
      const category = await models.category.create(data);
      return prepare(category);
    }
  }
};
