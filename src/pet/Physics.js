export class Physics {
  constructor() {
    this.gravity = 0.5;
    this.velocityX = 0;
    this.velocityY = 0;
    this.friction = 0.95;
    this.bounce = 0.3;
    this.isGrounded = true;
  }

  get groundY() {
    return window.innerHeight - 166;
  }

  update(pet) {
    if (!this.isGrounded) {
      this.velocityY += this.gravity;
      pet.y += this.velocityY;

      if (pet.y >= this.groundY) {
        pet.y = this.groundY;
        if (Math.abs(this.velocityY) > 2) {
          this.velocityY = -this.velocityY * this.bounce;
        } else {
          this.velocityY = 0;
          this.isGrounded = true;
        }
      }
    }

    if (this.velocityX !== 0) {
      pet.x += this.velocityX;
      this.velocityX *= this.friction;
      if (Math.abs(this.velocityX) < 0.1) this.velocityX = 0;
    }

    pet.x = Math.max(0, Math.min(window.innerWidth - 166, pet.x));
  }

  drop(velocityX = 0, velocityY = 0) {
    this.isGrounded = false;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
  }

  resetToTop() {
    this.isGrounded = false;
    this.velocityY = 0;
  }
}
