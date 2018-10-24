import { Store } from 'svelte/store';
import Recipe from '../domain/Recipe';
import recipeData from './data/recipe.json';

class ApplicationState extends Store {
  constructor(...args) {
    super(...args);
    this.setupComputedProps();
    this.loadRecipes(1, 2, 3, 4);
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
  }
}

const applicationStore = new ApplicationState({
  recipes: [],
  currentRecipe: {
    id: null,
    currentStep: null
  }
});

export default applicationStore;
