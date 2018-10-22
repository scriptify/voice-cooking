function say(text) {
    const speechSynthesis = window.speechSynthesis || window.webkitSpeechSynthesis;
    const sayThis = new SpeechSynthesisUtterance(text);
    sayThis.lang = 'en-US';
    speechSynthesis.speak(sayThis);
}

export default function setup() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const SpeechGrammarList =  window.SpeechGrammarList || window.webkitSpeechGrammarList

    if (!SpeechRecognition || !SpeechGrammarList) {
        console.error('This browser does not support the Web Speech API');
        return false;
    }

    const commands = [
        {
            cmd: 'next',
            say: 'Ok, I will go further.'
        },
        {
            cmd: 'back',
            say: 'Are you sure? Going back is never a good idea, my dear.'
        }
    ];
    const grammar = `#JSGF V1.0; grammar commands; public <command> = ${commands.map(cmd => cmd.cmd).join(' | ')} ;`

    const recognition = new SpeechRecognition();
    const speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.addEventListener('result', (e) => {
        const { results } = e;
        const [{ transcript }] = results[results.length - 1];
        console.log({ transcript, results })
        const cmdToExecute = commands.find(cmd => transcript.toLowerCase().includes(cmd.cmd));
        if (cmdToExecute)
            say(cmdToExecute.say);
    });
    /* recognition.addEventListener('speechend', (e) => {
        console.log('speechend', e);
    });
    recognition.addEventListener('nomatch', (e) => {
        console.log('nomatch', e);
    });
    recognition.addEventListener('error', (e) => {
        console.log('error', e);
    }); */

    recognition.start();

}