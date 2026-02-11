export class MouseTracker {
  constructor(pet) {
    this.pet = pet;
    this.mouseX = 0;
    this.mouseY = 0;
    this.lastMoveTime = Date.now();
    this.isIdle = false;
    this.idleThreshold = 20000;
    this.mouseInWindow = true;

    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.lastMoveTime = Date.now();
      this.isIdle = false;
    });

    document.addEventListener('mouseenter', () => {
      this.mouseInWindow = true;
    });

    document.addEventListener('mouseleave', () => {
      this.mouseInWindow = false;
      this.isIdle = false;
      const current = this.pet.behaviorManager.current;
      if (current && current.name === 'chase') {
        this.pet.behaviorManager.transition('sleep', true);
      }
    });
  }

  update() {
    if (!this.mouseInWindow) return;
    const elapsed = Date.now() - this.lastMoveTime;
    if (elapsed > this.idleThreshold && !this.isIdle) {
      this.isIdle = true;
      this.pet.behaviorManager.transition('chase');
    }
  }
}
