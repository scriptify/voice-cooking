import EventEmitter from './util/EventEmitter';
import SpeechCommand from './util/SpeechCommand';
import { say } from './util/speech';

export default class Recipe extends EventEmitter {
  constructor(data) {
    super();
    this.data = data;
    this.currentStep = 0;
    this.setupCommandListeners();
  }

  setupCommandListeners() {
    const NEXT_CMD = 'next step';
    const NEXT_CMD_1 = 'next';
    const BACK_CMD = 'go back';
    const BACK_CMD_1 = 'back';
    const BACK_CMD_2 = 'bag';

    const speechCommand = new SpeechCommand([
      NEXT_CMD,
      BACK_CMD,
      BACK_CMD_1
    ]);

    speechCommand.addEventListener('command', (command) => {
      let newStepValue;

      switch (command) {
        case NEXT_CMD:
        case NEXT_CMD_1:
          newStepValue = this.currentStep + 1;
          if (newStepValue >= this.data.steps.length)
            return;
          const { text: textToSpeech } = this.data.steps[newStepValue];
          say(textToSpeech);
        break;

        case BACK_CMD:
        case BACK_CMD_1:
        case BACK_CMD_2:
          newStepValue = this.currentStep - 1;
          if (newStepValue < 0)
            return;
        break;
        default:
          return;
      }

      this.currentStep = newStepValue;
      this.emit('step');

    });

  }

  get currentProgress() {
    return {
      current: this.currentStep + 1,
      of: this.data.steps.length
    };
  }

}
