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

  changeStep(newStepValue) {
    const hasStepChanged = newStepValue !== this.currentStep;
    this.currentStep = newStepValue;

    if (hasStepChanged)
      this.say();

    this.emit('step');
  }

  setupCommandListeners() {

    const timerCmds = this.data.steps
      .map((step, stepIndex) => {
        if (step.setTimer && step.setTimer.name) {
          const action = () => {
            if (step.setTimer.wasStarted)
              return;
            step.setTimer.wasStarted = true;
            const startTime = Date.now();
            const durationMs = step.setTimer.duration * 1000;
            const interval = setInterval(() => {
              const currentTime = Date.now();
              const timePassed = currentTime - startTime;
              if (timePassed >= durationMs) {
                // Time expired
                clearInterval(interval);
                this.emit('timerstop', stepIndex);
                if (step.setTimer.stopText)
                  say(step.setTimer.stopText);
              }
              const procentualProgress = (1 / durationMs) * timePassed;
              this.emit('timerupdate', { ofStep: stepIndex, procentualProgress })
            }, 300);

            say(`The timer is set for ${(step.setTimer.duration / 60).toFixed(1)} minutes.`);
            this.emit('timerstart', stepIndex);
          };
          return { cmds: [`start ${step.setTimer.name} timer`], action };
        }
        return null;
      })
      .filter(el => el);

    const possibleCommands = [
      {
        cmds: ['next', 'next step'],
        action: () => {
          const newStepValue = this.currentStep + 1;
          if (newStepValue >= this.data.steps.length)
            return;
          this.changeStep(newStepValue);
        }
      },
      {
        cmds: ['go back', 'back', 'bag'],
        action: () => {
          const newStepValue = this.currentStep - 1;
          if (newStepValue < 0)
            return;
          this.changeStep(newStepValue);
        }
      },
      ...timerCmds
    ];
    
    const preparedCmds = possibleCommands.reduce((acc, el) => acc.concat(el.cmds), []);
    const speechCommand = new SpeechCommand(preparedCmds);

    this.say(); // Utter first step

    speechCommand.addEventListener('command', (command) => {
      console.log({ command });
      const matchingAction = possibleCommands.find((cmd) => cmd.cmds.find(c => c === command));
      if (!matchingAction)
        return;

      matchingAction.action();
    });

  }

  get currentProgress() {
    return {
      current: this.currentStep + 1,
      of: this.data.steps.length
    };
  }

}
