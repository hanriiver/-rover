import { Behavior } from './Behavior.js';
import { Effects } from '../ui/Effects.js';

export class CrashBehavior extends Behavior {
  name = 'crash';
  landed = false;

  duration() {
    return 3000;
  }

  enter() {
    this.landed = false;
    this.pet.y = 0;
    this.pet.physics.resetToTop();
  }

  update(dt) {
    if (!this.landed && this.pet.physics.isGrounded) {
      this.landed = true;
      Effects.shakeScreen();
      Effects.spawnCrack(this.pet.x + 32, this.pet.y + 50);
    }
  }

  chooseNext() {
    return 'idle';
  }
}
