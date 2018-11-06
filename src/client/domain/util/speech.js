import EventEmitter from './EventEmitter';

let speechRecognitionList;
const eventEmitter = new EventEmitter();

function setup() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;

  if (!SpeechRecognition || !SpeechGrammarList) {
    console.error('This browser does not support the Web Speech API');
    return false;
  }

  const recognition = new SpeechRecognition();
  speechRecognitionList = new SpeechGrammarList();

  recognition.grammars = speechRecognitionList;

  recognition.continuous = true;
  recognition.lang = 'en-US';
  // recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.addEventListener('result', (e) => {
    const { results } = e;
    console.log({ results });
    const [{ transcript }] = results[results.length - 1];
    eventEmitter.emit('result', transcript);
    recognition.abort();
    setTimeout(() => {
      recognition.start();
    }, 300);
  });

  recognition.addEventListener('end', () => {
    setTimeout(() => {
      recognition.start();
    }, 300);
  });

  /* [
        'audiostart',
        'audioend',
        'end',
        'error',
        'nomatch',
        'result',
        'soundstart',
        'soundend',
        'speechend',
        'start'
       ].forEach(function(eventName) {
           recognition.addEventListener(eventName, (e) => console.log(eventName, e));
       }); */

  recognition.start();
  return true;
}


let isCurrentlySpeaking = false;
window.utterances = []; // Workaroud, otherwise 'onend' would not be fired
function utter(text) {
  isCurrentlySpeaking = true;
  const speechSynthesis = window.speechSynthesis || window.webkitSpeechSynthesis;
  const sayThis = new SpeechSynthesisUtterance(text);
  sayThis.lang = 'en-US';
  sayThis.rate = 1;
  sayThis.onend = () => {
    isCurrentlySpeaking = false;
  };
  window.utterances.push(sayThis);
  speechSynthesis.speak(sayThis);
}

export function say(text) { // Prevent from collision
  if (!isCurrentlySpeaking)
    utter(text);
  else
    setTimeout(() => say(text), 1000);
}

export function addGrammar(grammar) {
  speechRecognitionList.addFromString(grammar, 1);
}

export function onResult(fn) {
  eventEmitter.addEventListener('result', fn);
}

setup();
