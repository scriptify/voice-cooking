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
    this.compute('recipe', ['currentRecipe'], (currentRecipe) => {
      const recipe = this.get().recipes.find(r => r._id === currentRecipe.id);
      return recipe;
    });
    this.compute('step', ['currentRecipe'], (currentRecipe) => {
      const recipe = this.get().recipes.find(r => r._id === currentRecipe.id);
      if (!recipe)
        return { text: '' };
      return recipe.steps[currentRecipe.currentStep ? currentRecipe.currentStep : 0];
    });
  }

  async loadRecipe(recipeId) {

    const { data: { recipe } } = await this.apolloClient.query({
      query: gql`
        query QueryRecipe($id: ID) {
          recipe(id: $id) {
            _id
            title
            duration
            description
            ingredients {
              name
              amount {
                unit
                value
              }
            }
            steps {
              text
              coverImage
              setTimer {
                name
                duration
                stopText
              }
            }
            diets {
              title
              description
              image
            }
            image
          }
        }
      `,
      variables: { id: recipeId }
    });

    const newRecipe = new Recipe(recipe);

    this.set({
      recipes: this.get().recipes.concat(recipe)
    });

    newRecipe.addEventListener('step', () => {
      const { currentRecipe } = this.get();
      this.set({
        currentRecipe: {
          ...currentRecipe,
          currentStep: newRecipe.currentStep
        }
      });
    });

    newRecipe.addEventListener('timerstart', () => {
      const { currentRecipe } = this.get();
      this.set({
        currentRecipe: {
          ...currentRecipe,
          timers: currentRecipe.timers.concat({ ofStep: newRecipe.currentStep })
        }
      });
    });

    newRecipe.addEventListener('timerstop', (ofStep) => {
      const { currentRecipe } = this.get();
      this.set({
        currentRecipe: {
          ...currentRecipe,
          timers: currentRecipe.timers.filter(t => t.ofStep !== ofStep)
        }
      });
    });

  }

  setCurrentCategory(categoryId) {
    this.set({
      currentCategory: categoryId
    });
  }

  async setCurrentRecipe(recipeId) {
    await this.loadRecipe(recipeId);
    this.set({
      currentCategory: null,
      currentRecipe: {
        id: recipeId,
        currentStep: 0,
        timers: []
      }
    });
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
        currentStep: null,
        timers: []
      },
      currentCategory: null,
      graphql
    }
  });
};
