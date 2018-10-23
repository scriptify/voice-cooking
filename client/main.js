import App from './components/App/index.html';
import store from './state/store';

const app = new App({
	target: document.querySelector('#app'),
	store
});

export default app;