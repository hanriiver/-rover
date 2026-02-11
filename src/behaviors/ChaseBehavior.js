import { Behavior } from './Behavior.js';
import { BehaviorManager } from './BehaviorManager.js';

export class ChaseBehavior extends Behavior {
  name = 'chase';
  canInterrupt = true;
  speed = 4;
  elapsed = 0;
  chasing = false;
  caughtTimer = 0;

  duration() {
    return null;
  }

  enter() {
    this.elapsed = 0;
    this.chasing = false;
    this.caughtTimer = 0;
    this.pet.speechBubble.show('...huh?', 1500);
    setTimeout(() => {
      this.chasing = true;
      this.pet.speechBubble.show('Gotcha!!', 1500);
    }, 1000);
  }

  update(dt) {
    this.elapsed += dt;

    if (this.elapsed > 8000) {
      this.pet.behaviorManager.transition(this.chooseNext());
      return;
    }

    if (!this.chasing) return;

    const tracker = this.pet.mouseTracker;
    const dx = tracker.mouseX - (this.pet.x + 32);
    const dy = tracker.mouseY - (this.pet.y + 32);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 30) {
      if (this.caughtTimer === 0) {
        this.pet.speechBubble.show('Bite!', 2000);
      }
      this.caughtTimer += dt;
      if (this.caughtTimer > 2000) {
        this.pet.behaviorManager.transition(this.chooseNext());
      }
      return;
    }

    this.caughtTimer = 0;
    this.pet.direction = dx > 0 ? 1 : -1;
    this.pet.x += this.pet.direction * this.speed;

    this.pet.x = Math.max(0, Math.min(window.innerWidth - 166, this.pet.x));
  }

  exit() {
    this.pet.speechBubble.hide();
    this.pet.y = this.pet.physics.groundY;
    this.pet.physics.isGrounded = true;
  }

  chooseNext() {
    return BehaviorManager.weightedRandom({
      bark: 50,
      idle: 50,
    });
  }
}
