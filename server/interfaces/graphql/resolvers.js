module.exports = {
  Query: {
    recipe: async (parent, { id }, { models }) => {
      const recipe = await models.recipe.get(id);
      return recipe;
    },
    recipes: async (parent, params, { models }) => {
      const recipes = await models.recipe.get();
      return recipes;
    }
  },
  Mutation: {
    recipeCreate: async (parent, { data }, { models }) => {
      const recipe = await models.recipe.create(data);
      return recipe;
    }
  }
};
