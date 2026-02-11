import { Behavior } from './Behavior.js';
import { Effects } from '../ui/Effects.js';

export class PeeBehavior extends Behavior {
  name = 'pee';

  duration() {
    return 2000;
  }

  enter() {
    if (this.pet.x < window.innerWidth / 2) {
      this.pet.direction = -1;
    } else {
      this.pet.direction = 1;
    }
  }

  exit() {
    Effects.spawnPee(this.pet.x + 32, this.pet.y + 40, this.pet.direction);
  }

  chooseNext() {
    return 'walk';
  }
}
