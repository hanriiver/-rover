import { Behavior } from './Behavior.js';

const BARK_LINES = [
  'Woof!', 'Bark bark!', 'Arf!', 'Ruff ruff!', 'Grrr...',
  'Whine~', "I'm hungry...", 'Play with me!', "I'm bored~"
];

export class BarkBehavior extends Behavior {
  name = 'bark';

  duration() {
    return 1500;
  }

  enter() {
    const line = BARK_LINES[Math.floor(Math.random() * BARK_LINES.length)];
    this.pet.speechBubble.show(line, 1500);
  }

  exit() {
    this.pet.speechBubble.hide();
  }

  chooseNext() {
    return 'idle';
  }
}
