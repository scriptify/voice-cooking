import App from './components/App/index.html';
import createStore from './state/store';

import './index.css';

const store = createStore();

const app = new App({
  target: document.querySelector('#app'),
  store
});

export default app;
