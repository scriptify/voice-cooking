import EventEmitter from './util/EventEmitter';
import SpeechCommand from './util/SpeechCommand';

export default class Recipe extends EventEmitter {
  constructor(data) {
    super();
    this.data = data;
    this.currentStep = 0;
    this.setupCommandListeners();
  }

  setupCommandListeners() {
    const NEXT_CMD = 'next';
    const BACK_CMD = 'back';
    const speechCommand = new SpeechCommand([
      NEXT_CMD,
      BACK_CMD
    ]);

    speechCommand.addEventListener('command', (command) => {
      let newStepValue;

      switch (command) {
        case NEXT_CMD:
          newStepValue = this.currentStep + 1;
          if (newStepValue >= this.data.steps.length)
            return;
        break;

        case BACK_CMD:
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
