import { Behavior } from './Behavior.js';
import { BehaviorManager } from './BehaviorManager.js';

export class WalkBehavior extends Behavior {
  name = 'walk';
  speed = 1.5 + Math.random() * 0.5;

  enter() {
    if (Math.random() > 0.5) {
      this.pet.direction = -this.pet.direction;
    }
  }

  duration() {
    return 2000 + Math.random() * 3000;
  }

  update(dt) {
    this.pet.x += this.speed * this.pet.direction;

    if (this.pet.x <= 0) {
      this.pet.x = 0;
      this.pet.direction = 1;
    } else if (this.pet.x >= window.innerWidth - 166) {
      this.pet.x = window.innerWidth - 166;
      this.pet.direction = -1;
    }

    if (Math.random() < 0.01) {
      this.pet.direction = -this.pet.direction;
    }
  }

  chooseNext() {
    return BehaviorManager.weightedRandom({
      idle: 40,
      walk: 30,
      sit: 20,
      bark: 10,
    });
  }
}
