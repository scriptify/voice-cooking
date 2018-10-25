import { Store } from 'svelte/store';
import ApolloClient from 'apollo-boost';
import { createProvider } from 'svelte-apollo';
import gql from "graphql-tag";

import Recipe from '../domain/Recipe';

class ApplicationState extends Store {
  constructor({ apolloClient, initialState }) {
    super(initialState);
    this.apolloClient = apolloClient;
    this.setupComputedProps();
    // this.loadRecipes(1, 2, 3, 4);
  }

  setupComputedProps() {
    this.compute('recipe', ['currentRecipe'], (currentRecipe) => this.get().recipes[currentRecipe.id]);
    this.compute('step', ['currentRecipe'], (currentRecipe) => {
      const recipe = this.get().recipes[currentRecipe.id];
      if (!recipe)
        return { text: '' };
      return recipe.data.steps[currentRecipe.currentStep ? currentRecipe.currentStep : 0];
    });
  }

  async loadRecipes() {
    const { recipes, currentRecipe } = this.get();
    const newRecipe = new Recipe(recipeData);

    newRecipe.addEventListener('step', () => {
      const { currentRecipe } = this.get();
      this.set({
        currentRecipe: {
          ...currentRecipe,
          currentStep: newRecipe.currentStep
        }
      });
    });

    this.set({
      recipes: recipes.concat([newRecipe]),
      currentRecipe: {
        ...currentRecipe,
        id: 0
      }
    });

    const queried = await this.apolloClient.query({
      query: gql`
        query QueryRecipes {
          recipes {title}
        }
      `
    });
    console.log({ queried })
  }
}



export default function createStore() {
  const apolloClient = new ApolloClient({ uri: 'http://localhost:4000' });
  const graphql = createProvider(apolloClient);

  return new ApplicationState({
    apolloClient,
    initialState: {
      recipes: [],
      currentRecipe: {
        id: null,
        currentStep: null
      },
      graphql
    }
  });
};
