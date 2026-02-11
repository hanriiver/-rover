import { Behavior } from './Behavior.js';
import { BehaviorManager } from './BehaviorManager.js';
import { Effects } from '../ui/Effects.js';

export class PoopBehavior extends Behavior {
  name = 'poop';
  elapsed = 0;
  showed = false;

  duration() {
    return 2500;
  }

  enter() {
    this.elapsed = 0;
    this.showed = false;
    this.pet.speechBubble.show('...', -1);
  }

  update(dt) {
    this.elapsed += dt;
    if (this.elapsed >= 1500 && !this.showed) {
      this.showed = true;
      this.pet.speechBubble.updateText('Phew~');
    }
  }

  exit() {
    this.pet.speechBubble.hide();
    Effects.spawnPoop(this.pet.x + 20, this.pet.y + 50);
  }

  chooseNext() {
    return BehaviorManager.weightedRandom({
      walk: 70,
      idle: 30,
    });
  }
}
