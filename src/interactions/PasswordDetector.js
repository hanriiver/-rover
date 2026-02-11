export class PasswordDetector {
  constructor(pet) {
    this.pet = pet;

    this.scan();

    this.observer = new MutationObserver(() => this.scan());
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  scan() {
    const inputs = document.querySelectorAll('input[type="password"]');
    inputs.forEach((input) => {
      if (input._shibaWatching) return;
      input._shibaWatching = true;

      input.addEventListener('focus', () => {
        this.pet.behaviorManager.transition('hideEyes', true);
      });

      input.addEventListener('blur', () => {
        if (this.pet.behaviorManager.current?.name === 'hideEyes') {
          this.pet.behaviorManager.transition('idle', true);
        }
      });
    });
  }
}
