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
    if (this.idleTime < 10000) {
      return BehaviorManager.weightedRandom({
        walk: 40,
        sit: 30,
        idle: 30,
      });
    } else {
      return BehaviorManager.weightedRandom({
        sleep: 60,
        idle: 40,
      });
    }
  }
}
