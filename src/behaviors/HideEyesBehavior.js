import { Behavior } from './Behavior.js';

export class HideEyesBehavior extends Behavior {
  name = 'hide-eyes';
  canInterrupt = false;
  priority = 10;

  duration() {
    return null;
  }

  enter() {
    this.pet.speechBubble.show("I'm not looking!", -1);
  }

  exit() {
    this.pet.speechBubble.hide();
  }

  chooseNext() {
    return 'idle';
  }
}
