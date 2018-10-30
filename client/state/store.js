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
    this.compute('possibleTimers', ['currentRecipe'], () => {
      const { recipes, currentRecipe } = this.get();
      const { currentStep, executedTimers } = currentRecipe;
      const recipe = recipes.find(r => r._id === currentRecipe.id);
      if (!recipe)
        return [];
      const allTimersUntilNow = recipe.steps
        .slice(0, currentStep + 1)
        .map(step => step.setTimer && step.setTimer.name ? step.setTimer : null)
        .filter((timer, index) => {
          if (!timer)
            return false;
          return !executedTimers.find(t => t.ofStep === index);
        });

      return allTimersUntilNow;
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

    newRecipe.addEventListener('timerstart', (ofStep) => {
      const { currentRecipe } = this.get();
      this.set({
        currentRecipe: {
          ...currentRecipe,
          activeTimers: currentRecipe.activeTimers.concat({ ofStep }),
          executedTimers: currentRecipe.executedTimers.concat({ ofStep })
        }
      });
    });

    newRecipe.addEventListener('timerstop', (ofStep) => {
      const { currentRecipe } = this.get();
      this.set({
        currentRecipe: {
          ...currentRecipe,
          activeTimers: currentRecipe.activeTimers.filter(t => t.ofStep !== ofStep)
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
        activeTimers: [],
        executedTimers: []
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
        activeTimers: [],
        finishedTimers: []
      },
      currentCategory: null,
      graphql
    }
  });
};
