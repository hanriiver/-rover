export class SpriteManager {
  constructor() {
    this.sprites = {};
    this.current = null;
    this.element = null;

    const names = [
      'idle', 'walk', 'sleep', 'bark', 'sit',
      'pee', 'poop', 'cry', 'flip', 'chase',
      'crash', 'hide-eyes', 'bounceup', 'bouncing', 'talk', 'focus'
    ];

    for (const name of names) {
      this.sprites[name] = chrome.runtime.getURL(`sprites/${name}.gif`);
    }
  }

  bind(imgElement) {
    this.element = imgElement;
    this.canvas = document.createElement('canvas');
    this.frozen = false;
  }

  play(name) {
    if (this.current === name) return;
    this.current = name;
    this.frozen = false;
    this.element.src = '';
    requestAnimationFrame(() => {
      this.element.src = this.sprites[name] || this.sprites.idle;
    });
  }

  freeze() {
    if (this.frozen) return;
    this.frozen = true;
    const w = this.element.naturalWidth || this.element.width;
    const h = this.element.naturalHeight || this.element.height;
    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.getContext('2d').drawImage(this.element, 0, 0);
    this.element.src = this.canvas.toDataURL();
  }

  setDirection(dir) {
    this.element.style.transform = dir === -1 ? 'scaleX(-1)' : '';
  }
}
