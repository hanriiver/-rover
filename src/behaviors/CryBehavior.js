import { Behavior } from './Behavior.js';
import { BehaviorManager } from './BehaviorManager.js';

const CRY_LINES = ['*sniff*...', 'Pay attention...', "I'm lonely...", 'Why won\'t you play...'];

export class CryBehavior extends Behavior {
  name = 'cry';

  duration() {
    return 3000;
  }

  enter() {
    const line = CRY_LINES[Math.floor(Math.random() * CRY_LINES.length)];
    this.pet.speechBubble.show(line, 3000);
  }

  exit() {
    this.pet.speechBubble.hide();
  }

  chooseNext() {
    return BehaviorManager.weightedRandom({
      idle: 70,
      sit: 30,
    });
  }
}
