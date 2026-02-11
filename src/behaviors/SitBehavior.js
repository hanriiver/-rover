import { Behavior } from './Behavior.js';
import { BehaviorManager } from './BehaviorManager.js';

export class SitBehavior extends Behavior {
  name = 'idle';

  duration() {
    return 3000 + Math.random() * 2000;
  }

  chooseNext() {
    return BehaviorManager.weightedRandom({
      idle: 50,
      walk: 50,
    });
  }
}
