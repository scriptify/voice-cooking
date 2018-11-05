import { Store } from 'svelte/store';
import ApolloClient from 'apollo-boost';
import { createProvider } from 'svelte-apollo';
import gql from 'graphql-tag';

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
    this.compute('timersToShow', ['currentRecipe'], () => {
      const { recipes, currentRecipe } = this.get();
      const { currentStep, executedTimers } = currentRecipe;
      const recipe = recipes.find(r => r._id === currentRecipe.id);
      if (!recipe)
        return [];
      const allTimersUntilNow = recipe.steps
        .slice(0, currentStep + 1)
        .map((step, stepIndex) => {
          const timer = step.setTimer && step.setTimer.name ? step.setTimer : null;
          if (!timer)
            return null;
          const activeTimer = currentRecipe.activeTimers.find(t => t.ofStep === stepIndex);
          return {
            ...timer,
            percentualProgress: activeTimer ? activeTimer.percentualProgress : 100,
            inactive: !(activeTimer)
          };
        })
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
                color
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
      recipes: this.get().recipes.concat(recipe),
      currentRecipeInstance: newRecipe
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
          activeTimers: currentRecipe.activeTimers.concat({ ofStep, percentualProgress: 0 })
        }
      });
    });

    newRecipe.addEventListener('timerstop', (ofStep) => {
      const { currentRecipe } = this.get();
      this.set({
        currentRecipe: {
          ...currentRecipe,
          activeTimers: currentRecipe.activeTimers.filter(t => t.ofStep !== ofStep),
          executedTimers: currentRecipe.executedTimers.concat({ ofStep })
        }
      });
    });

    newRecipe.addEventListener('timerupdate', ({ ofStep, percentualProgress }) => {
      const { currentRecipe } = this.get();
      this.set({
        currentRecipe: {
          ...currentRecipe,
          activeTimers: currentRecipe.activeTimers.map((timer) => {
            if (timer.ofStep === ofStep) {
              return {
                ...timer,
                percentualProgress: percentualProgress * 100
              };
            }
            return timer;
          })
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
      graphql,
      currentRecipeInstance: null
    }
  });
}
