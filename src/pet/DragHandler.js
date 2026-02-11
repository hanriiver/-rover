export class DragHandler {
  constructor(pet) {
    this.pet = pet;
    this.isDragging = false;
    this.offset = { x: 0, y: 0 };
    this.lastPos = { x: 0, y: 0 };
    this.lastTime = 0;
    this.velocity = { x: 0, y: 0 };
    this.isBouncing = false;

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    pet.element.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseDown(e) {
    this.isDragging = true;
    this.isBouncing = false;
    this.offset.x = e.clientX - this.pet.x;
    this.offset.y = e.clientY - this.pet.y;
    this.lastPos = { x: e.clientX, y: e.clientY };
    this.lastTime = Date.now();
    this.pet.physics.isGrounded = true;
    this.pet.physics.velocityX = 0;
    this.pet.physics.velocityY = 0;
    this.pet.behaviorManager.pause();
    this.pet.spriteManager.play('bounceup');
  }

  onMouseMove(e) {
    if (!this.isDragging) return;

    const now = Date.now();
    const dt = now - this.lastTime;
    if (dt > 0) {
      this.velocity.x = (e.clientX - this.lastPos.x) / dt * 16;
      this.velocity.y = (e.clientY - this.lastPos.y) / dt * 16;
    }

    this.pet.spriteManager.play('bouncing');

    this.lastPos = { x: e.clientX, y: e.clientY };
    this.lastTime = now;

    this.pet.x = e.clientX - this.offset.x;
    this.pet.y = e.clientY - this.offset.y;

    this.pet.x = Math.max(0, Math.min(window.innerWidth - 166, this.pet.x));
    this.pet.y = Math.max(0, Math.min(window.innerHeight - 166, this.pet.y));
  }

  onMouseUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.isBouncing = true;

    this.pet.spriteManager.play('bouncing');
    this.pet.physics.drop(this.velocity.x, this.velocity.y);
  }

  checkLanded() {
    if (this.isBouncing && this.pet.physics.isGrounded) {
      this.isBouncing = false;
      this.pet.behaviorManager.resume();
    }
  }
}
