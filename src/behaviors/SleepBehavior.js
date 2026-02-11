import { Behavior } from './Behavior.js';

export class SleepBehavior extends Behavior {
  name = 'sleep';
  canInterrupt = true;
  zCount = 2;
  elapsed = 0;

  duration() {
    return 5000 + Math.random() * 5000;
  }

  enter() {
    this.zCount = 2;
    this.elapsed = 0;
    this.pet.speechBubble.show('zzZ...', -1);
    // GIF 한 번 재생 후 정지 (약 1초 후 freeze)
    setTimeout(() => {
      this.pet.spriteManager.freeze();
    }, 1000);
  }

  update(dt) {
    this.elapsed += dt;
    const newZ = 2 + Math.floor(this.elapsed / 3000);
    if (newZ !== this.zCount) {
      this.zCount = newZ;
      const text = 'zz' + 'Z'.repeat(this.zCount) + '...';
      this.pet.speechBubble.updateText(text);
    }
  }

  exit() {
    this.pet.speechBubble.hide();
  }

  chooseNext() {
    return 'idle';
  }
}
