import App from './App.html';
import setupSpeechRecognition from './speech';

const app = new App({
	target: document.body,
	data: {
		name: 'world'
	}
});

setupSpeechRecognition();

export default app;