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

    // sleep GIF: remove loop so it plays once and stops on last frame
    this._makeOneShotGif('sleep');
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
    this.element.onload = null;
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

  async _makeOneShotGif(name) {
    try {
      const url = this.sprites[name];
      if (!url) return;
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // Find and remove NETSCAPE2.0 Application Extension (controls looping)
      // Without it, browser plays GIF once and stops on last frame
      for (let i = 0; i < bytes.length - 19; i++) {
        if (bytes[i] === 0x21 && bytes[i + 1] === 0xFF && bytes[i + 2] === 0x0B) {
          const sig = String.fromCharCode(...bytes.slice(i + 3, i + 14));
          if (sig === 'NETSCAPE2.0') {
            const before = bytes.slice(0, i);
            const after = bytes.slice(i + 19);
            const modified = new Uint8Array(before.length + after.length);
            modified.set(before);
            modified.set(after, before.length);
            const blob = new Blob([modified], { type: 'image/gif' });
            this.sprites[name] = URL.createObjectURL(blob);
            return;
          }
        }
      }
      // No NETSCAPE extension = already plays once
    } catch (e) {
      // Keep original sprite on error
    }
  }
}
