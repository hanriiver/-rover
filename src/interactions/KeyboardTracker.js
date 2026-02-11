export class KeyboardTracker {
  constructor(pet) {
    this.pet = pet;
    this.typingTimer = null;
    this.isTyping = false;
    this.keyCount = 0;

    document.addEventListener('keydown', (e) => {
      // ignore if speech bubble input is active
      if (this.pet.speechBubble.isInputMode) return;

      this.keyCount++;
      this.isTyping = true;

      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(() => {
        this.isTyping = false;
        this.keyCount = 0;
      }, 2000);

      // first keypress — pet looks toward center (curious)
      if (this.keyCount === 1) {
        this.pet.direction = this.pet.x < window.innerWidth / 2 ? 1 : -1;
      }

      // rapid typing (10+ keys) — react once
      if (this.keyCount === 10) {
        const current = this.pet.behaviorManager.current;
        if (current && current.canInterrupt && current.name !== 'chase') {
          this.pet.behaviorManager.transition('sit', true);
          this.pet.speechBubble.show('*watching you type*', 2000);
        }
      }
    });
  }
}
