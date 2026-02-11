export class BehaviorManager {
  constructor(pet) {
    this.pet = pet;
    this.behaviors = {};
    this.current = null;
    this.timer = null;
  }

  register(name, BehaviorClass) {
    this.behaviors[name] = BehaviorClass;
  }

  pause() {
    if (this.current) this.current.exit();
    clearTimeout(this.timer);
    this.current = null;
    this.paused = true;
  }

  resume() {
    this.paused = false;
    this.transition('idle');
  }

  transition(name, force = false) {
    if (this.paused && !force) return;
    if (!this.behaviors[name]) return;
    if (this.current && !force && !this.current.canInterrupt) return;
    if (this.current && !force && this.behaviors[name]) {
      const NewBehavior = this.behaviors[name];
      const tempInstance = new NewBehavior(this.pet);
      if (this.current.priority > tempInstance.priority) return;
    }

    if (this.current) this.current.exit();
    clearTimeout(this.timer);

    const BehaviorClass = this.behaviors[name];
    this.current = new BehaviorClass(this.pet);
    this.current.enter();

    this.pet.spriteManager.play(this.current.name);

    const dur = this.current.duration();
    if (dur !== null) {
      this.timer = setTimeout(() => {
        const next = this.current.chooseNext();
        this.transition(next);
      }, dur);
    }
  }

  update(dt) {
    if (this.paused) return;
    if (this.current) this.current.update(dt);
  }

  static weightedRandom(options) {
    const total = Object.values(options).reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (const [name, weight] of Object.entries(options)) {
      r -= weight;
      if (r <= 0) return name;
    }
    return Object.keys(options)[0];
  }
}
