import EventEmitter from './EventEmitter';
import { addGrammar, onResult } from './speech';

function replaceAll(str, what, withThat) {
  let ret = str;
  while (ret.includes(what))
    ret = ret.replace(what, withThat);
  return ret;
}

export default class SpeechCommand extends EventEmitter {
  constructor(commands) {
    super();
    this.commands = commands;
    const grammar = `#JSGF V1.0; grammar commands; public <command> = ${commands.join(' | ')} ;`
    addGrammar(grammar);
    onResult(this.onResult.bind(this));
  }

  onResult(recognitionResult) {
    const MAX_LETTERS_TOO_MUCH = 12;
    const command = this.commands.find(command => recognitionResult.includes(command));

    if (!command)
      return;
    
    const stringTooMuch = (recognitionResult.substr(0, recognitionResult.indexOf(command)) +
      recognitionResult.substr(recognitionResult.indexOf(command) + command.length, recognitionResult.length))
    const lettersTooMuch = replaceAll(stringTooMuch, ' ', '').length;

    if (lettersTooMuch > MAX_LETTERS_TOO_MUCH)
      return;
    this.emit('command', command);
  }

  destroy() {

  }
}