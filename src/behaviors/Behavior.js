export class Behavior {
  name = '';
  canInterrupt = true;
  priority = 0;

  constructor(pet) {
    this.pet = pet;
  }

  enter() {}
  update(dt) {}
  exit() {}

  duration() {
    return 3000;
  }

  chooseNext() {
    return 'idle';
  }
}
