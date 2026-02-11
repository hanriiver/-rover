import { Behavior } from './Behavior.js';

export class FlipBehavior extends Behavior {
  name = 'flip';

  duration() {
    return 2500;
  }

  chooseNext() {
    return 'idle';
  }
}
