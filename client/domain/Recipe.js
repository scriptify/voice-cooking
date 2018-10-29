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

  say() {
    const { text: textToSpeech } = this.data.steps[this.currentStep];
    say(textToSpeech);
  }

  setupCommandListeners() {
    const NEXT_CMD = 'next step';
    const NEXT_CMD_1 = 'next';
    const BACK_CMD = 'go back';
    const BACK_CMD_1 = 'back';
    const BACK_CMD_2 = 'bag';
    const START_TIMER_CMD = 'start timer';

    const speechCommand = new SpeechCommand([
      NEXT_CMD,
      NEXT_CMD_1,
      BACK_CMD,
      BACK_CMD_1,
      BACK_CMD_2,
      START_TIMER_CMD
    ]);

    this.say(); // Utter first step

    speechCommand.addEventListener('command', (command) => {
      let newStepValue;

      switch (command) {
        case NEXT_CMD:
        case NEXT_CMD_1:
          newStepValue = this.currentStep + 1;
          if (newStepValue >= this.data.steps.length)
            return;
        break;

        case BACK_CMD:
        case BACK_CMD_1:
        case BACK_CMD_2:
          newStepValue = this.currentStep - 1;
          if (newStepValue < 0)
            return;
        break;

        case START_TIMER_CMD:
          const step = this.data.steps[this.currentStep];
          console.log('start timer', step)
          if (!step.setTimer)
            return; // Current step has no timer to set
          const stepIndex = this.currentStep; // Save step index
          setTimeout(() => {
            // Time expired
            this.emit('timerstop', stepIndex);
            if (step.setTimer.stopText)
              say(step.setTimer.stopText);
          }, step.setTimer.duration * 1000);
          say(`The timer is set for ${(step.setTimer.duration / 60).toFixed(1)} minutes.`);
          this.emit('timerstart');
          return;
        break;

        default:
          return;
      }

      const hasStepChanged = newStepValue !== this.currentStep;
      this.currentStep = newStepValue;

      if (hasStepChanged)
        this.say();

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
