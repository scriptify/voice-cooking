import { Store } from 'svelte/store';

class ApplicationState extends Store {
  greet(name) {
    this.set({ greeting: `Hello ${name}!` });
  }
}

const state = new ApplicationState({
  greeting: 'Hello world!'
});

export default state;