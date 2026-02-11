import { Behavior } from './Behavior.js';
import { BehaviorManager } from './BehaviorManager.js';

export class IdleBehavior extends Behavior {
  name = 'idle';
  idleTime = 0;

  duration() {
    return 2000 + Math.random() * 3000;
  }

  update(dt) {
    this.idleTime += dt;
  }

  chooseNext() {
    // Poop chance: 2%
    if (Math.random() < 0.02) return 'poop';

    // Pee chance: 5% when near edge
    const nearEdge = this.pet.x < 30 || this.pet.x > window.innerWidth - 94;
    if (nearEdge && Math.random() < 0.05) return 'pee';

    if (this.idleTime < 10000) {
      return BehaviorManager.weightedRandom({
        walk: 40,
        sit: 30,
        idle: 20,
        bark: 10,
      });
    } else {
      return BehaviorManager.weightedRandom({
        sleep: 50,
        cry: 30,
        bark: 20,
      });
    }
  }
}
