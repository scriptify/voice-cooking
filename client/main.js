import App from './components/App/index.html';
import store from './state/store';
import setupSpeechRecognition from './speech';

const app = new App({
	target: document.querySelector('#app'),
	store
});

setupSpeechRecognition();

export default app;